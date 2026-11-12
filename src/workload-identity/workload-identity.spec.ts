import fetch from 'jest-fetch-mock';
import {
  ApiKeyRequiredException,
  GenericServerException,
  OauthException,
  UnauthorizedException,
} from '../common/exceptions';
import { WorkloadIdentityOptions } from '../common/interfaces';
import { WorkOS } from '../index';
import { WorkOS as WorkOSWorker } from '../index.worker';

const TOKEN_ENDPOINT = 'https://signin.example.com/oauth2/token';
const API_URL = 'https://api.workos.com/organizations';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

interface MockReply {
  status?: number;
  body: unknown;
}

interface SeenRequest {
  url: string;
  headers: Headers;
  form: Record<string, string>;
}

type Responder = (request: SeenRequest) => MockReply | Promise<MockReply>;

/**
 * Serves the token endpoint and the API from one fetch mock and records what
 * each received. By default the exchange hands out `access-token-1`,
 * `access-token-2`, ... and the API accepts anything.
 */
function mockServers({
  exchange,
  api,
}: { exchange?: Responder; api?: Responder } = {}) {
  const exchanges: SeenRequest[] = [];
  const apiRequests: SeenRequest[] = [];

  const defaultExchange: Responder = () => ({
    body: {
      access_token: `access-token-${exchanges.length}`,
      token_type: 'Bearer',
      expires_in: 300,
    },
  });
  const defaultApi: Responder = () => ({ body: { data: [] } });

  fetch.mockResponse(async (request) => {
    const isExchange = request.url === TOKEN_ENDPOINT;
    const seen: SeenRequest = {
      url: request.url,
      headers: request.headers,
      form: isExchange
        ? Object.fromEntries(new URLSearchParams(await request.text()))
        : {},
    };
    (isExchange ? exchanges : apiRequests).push(seen);

    const respond = isExchange
      ? (exchange ?? defaultExchange)
      : (api ?? defaultApi);
    const { status = 200, body } = await respond(seen);

    return { status, headers: JSON_HEADERS, body: JSON.stringify(body) };
  });

  return { exchanges, apiRequests };
}

/** A token source that returns a different ID token on every call. */
function idTokenSource() {
  let calls = 0;
  return jest.fn(async () => `id-token-${++calls}`);
}

function createWorkOS(
  overrides: Partial<WorkloadIdentityOptions> = {},
  Client: typeof WorkOS = WorkOS,
) {
  const tokenSource = idTokenSource();
  const workos = new Client({
    maxRetries: 0,
    workloadIdentity: {
      clientId: 'client_machine',
      tokenSource,
      tokenEndpoint: TOKEN_ENDPOINT,
      ...overrides,
    },
  });

  return { workos, tokenSource };
}

/** Everything a caller or a log line could read off an error. */
function errorText(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  return [
    error.message,
    error.stack,
    String(error),
    JSON.stringify(error),
    JSON.stringify(error, Object.getOwnPropertyNames(error)),
    error.cause === undefined ? '' : errorText(error.cause),
  ].join('\n');
}

describe('workload identity', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    fetch.resetMocks();
    process.env = { ...OLD_ENV };
    delete process.env.WORKOS_API_KEY;
    delete process.env.WORKOS_CLIENT_ID;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('first use', () => {
    it('exchanges the ID token and sends the access token as a bearer', async () => {
      const { exchanges, apiRequests } = mockServers();
      const { workos, tokenSource } = createWorkOS();

      expect(tokenSource).not.toHaveBeenCalled();

      const { data } = await workos.get('/organizations');

      expect(data).toEqual({ data: [] });
      expect(tokenSource).toHaveBeenCalledTimes(1);
      expect(exchanges).toHaveLength(1);
      expect(exchanges[0].form).toEqual({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: 'id-token-1',
        client_id: 'client_machine',
        resource: 'https://api.workos.com',
      });
      expect(exchanges[0].headers.get('content-type')).toContain(
        'application/x-www-form-urlencoded',
      );
      expect(exchanges[0].headers.get('authorization')).toBeNull();

      expect(apiRequests).toHaveLength(1);
      expect(apiRequests[0].url).toBe(API_URL);
      expect(apiRequests[0].headers.get('authorization')).toBe(
        'Bearer access-token-1',
      );
      expect(apiRequests[0].headers.get('x-url-environment-id')).toBeNull();
    });

    it('sends the configured environment ID and scope', async () => {
      const { exchanges, apiRequests } = mockServers();
      const { workos } = createWorkOS({
        environmentId: 'environment_123',
        scope: ['orgs:read', 'orgs:write'],
      });

      await workos.post('/organizations', { name: 'Acme' });

      expect(exchanges[0].form.scope).toBe('orgs:read orgs:write');
      expect(apiRequests[0].headers.get('x-url-environment-id')).toBe(
        'environment_123',
      );
      expect(apiRequests[0].headers.get('authorization')).toBe(
        'Bearer access-token-1',
      );
    });

    it.each([
      ['put', (workos: WorkOS) => workos.put('/organizations/org_1', {})],
      ['patch', (workos: WorkOS) => workos.patch('/organizations/org_1', {})],
      ['delete', (workos: WorkOS) => workos.delete('/organizations/org_1')],
      [
        'deleteWithBody',
        (workos: WorkOS) => workos.deleteWithBody('/organizations/org_1', {}),
      ],
    ])('authenticates %s requests', async (_method, call) => {
      const { apiRequests } = mockServers();
      const { workos } = createWorkOS({ environmentId: 'environment_123' });

      await call(workos);

      expect(apiRequests[0].headers.get('authorization')).toBe(
        'Bearer access-token-1',
      );
      expect(apiRequests[0].headers.get('x-url-environment-id')).toBe(
        'environment_123',
      );
    });

    it('works in the worker entry', async () => {
      const { exchanges, apiRequests } = mockServers();
      const { workos } = createWorkOS(
        { environmentId: 'environment_123' },
        WorkOSWorker,
      );

      await workos.get('/organizations');

      expect(exchanges).toHaveLength(1);
      expect(apiRequests[0].headers.get('authorization')).toBe(
        'Bearer access-token-1',
      );
      expect(apiRequests[0].headers.get('x-url-environment-id')).toBe(
        'environment_123',
      );
    });

    it('leaves a per-request access token alone', async () => {
      const { exchanges, apiRequests } = mockServers();
      const { workos } = createWorkOS();

      await workos.get('/organizations', { accessToken: 'user-token' });

      expect(exchanges).toHaveLength(0);
      expect(apiRequests[0].headers.get('authorization')).toBe(
        'Bearer user-token',
      );
    });

    it('still requires an API key for methods that send it as the client secret', async () => {
      const { exchanges, apiRequests } = mockServers();
      const { workos, tokenSource } = createWorkOS();

      await expect(
        workos.userManagement.authenticateWithPassword({
          clientId: 'client_123',
          email: 'user@example.com',
          password: 'password',
        }),
      ).rejects.toBeInstanceOf(ApiKeyRequiredException);

      expect(tokenSource).not.toHaveBeenCalled();
      expect(exchanges).toHaveLength(0);
      expect(apiRequests).toHaveLength(0);
    });

    it('times out a token source that never settles and exchanges again on the next request', async () => {
      const { exchanges } = mockServers();
      const tokenSource = jest
        .fn<Promise<string>, []>()
        .mockReturnValueOnce(new Promise<string>(() => undefined))
        .mockResolvedValue('id-token');
      const workos = new WorkOS({
        maxRetries: 0,
        timeout: 20,
        workloadIdentity: {
          clientId: 'client_machine',
          tokenSource,
          tokenEndpoint: TOKEN_ENDPOINT,
        },
      });

      await expect(workos.get('/organizations')).rejects.toThrow(
        'Workload identity token exchange timed out after 20ms.',
      );
      expect(exchanges).toHaveLength(0);

      await workos.get('/organizations');
      expect(tokenSource).toHaveBeenCalledTimes(2);
      expect(exchanges).toHaveLength(1);
    });

    it('sends no machine token on public-client calls that skip the API key check', async () => {
      const { exchanges, apiRequests } = mockServers();
      const { workos, tokenSource } = createWorkOS();

      await workos.post(
        '/user_management/authenticate',
        {},
        { skipApiKeyCheck: true },
      );

      expect(tokenSource).not.toHaveBeenCalled();
      expect(exchanges).toHaveLength(0);
      expect(apiRequests[0].headers.get('authorization')).toBeNull();
    });
  });

  describe('reuse', () => {
    it('keeps the access token for later requests', async () => {
      const { exchanges, apiRequests } = mockServers();
      const { workos, tokenSource } = createWorkOS();

      await workos.get('/organizations');
      await workos.get('/organizations');
      await workos.post('/organizations', { name: 'Acme' });

      expect(tokenSource).toHaveBeenCalledTimes(1);
      expect(exchanges).toHaveLength(1);
      expect(
        apiRequests.map((request) => request.headers.get('authorization')),
      ).toEqual([
        'Bearer access-token-1',
        'Bearer access-token-1',
        'Bearer access-token-1',
      ]);
    });
  });

  describe('refresh before expiry', () => {
    it('exchanges a fresh ID token shortly before the access token expires', async () => {
      const { exchanges, apiRequests } = mockServers();
      const { workos, tokenSource } = createWorkOS();
      const start = 1_700_000_000_000;
      const now = jest.spyOn(Date, 'now').mockReturnValue(start);

      await workos.get('/organizations');

      // 300 second lifetime, 30 second margin: still good at 269 seconds.
      now.mockReturnValue(start + 269_000);
      await workos.get('/organizations');
      expect(exchanges).toHaveLength(1);

      now.mockReturnValue(start + 271_000);
      await workos.get('/organizations');

      expect(tokenSource).toHaveBeenCalledTimes(2);
      expect(exchanges.map((request) => request.form.assertion)).toEqual([
        'id-token-1',
        'id-token-2',
      ]);
      expect(apiRequests[2].headers.get('authorization')).toBe(
        'Bearer access-token-2',
      );
    });

    it('still reuses a token whose lifetime is shorter than the margin', async () => {
      const { exchanges } = mockServers({
        exchange: () => ({
          body: { access_token: 'short', token_type: 'Bearer', expires_in: 20 },
        }),
      });
      const { workos } = createWorkOS();
      const start = 1_700_000_000_000;
      const now = jest.spyOn(Date, 'now').mockReturnValue(start);

      await workos.get('/organizations');
      now.mockReturnValue(start + 9_000);
      await workos.get('/organizations');
      expect(exchanges).toHaveLength(1);

      now.mockReturnValue(start + 11_000);
      await workos.get('/organizations');
      expect(exchanges).toHaveLength(2);
    });
  });

  describe('refresh on 401', () => {
    it('exchanges again and retries the request once', async () => {
      const { exchanges, apiRequests } = mockServers({
        api: (request) =>
          request.headers.get('authorization') === 'Bearer access-token-1'
            ? { status: 401, body: { message: 'Unauthorized' } }
            : { body: { id: 'org_1' } },
      });
      const { workos, tokenSource } = createWorkOS();

      const { data } = await workos.get('/organizations');

      expect(data).toEqual({ id: 'org_1' });
      expect(tokenSource).toHaveBeenCalledTimes(2);
      expect(exchanges.map((request) => request.form.assertion)).toEqual([
        'id-token-1',
        'id-token-2',
      ]);
      expect(
        apiRequests.map((request) => request.headers.get('authorization')),
      ).toEqual(['Bearer access-token-1', 'Bearer access-token-2']);
    });

    it('gives up after one retry', async () => {
      const { exchanges, apiRequests } = mockServers({
        api: () => ({ status: 401, body: { message: 'Unauthorized' } }),
      });
      const { workos } = createWorkOS();

      await expect(workos.get('/organizations')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(exchanges).toHaveLength(2);
      expect(apiRequests).toHaveLength(2);
    });

    it('does not exchange again for other failures', async () => {
      const { exchanges, apiRequests } = mockServers({
        api: () => ({ status: 404, body: { message: 'Not found' } }),
      });
      const { workos } = createWorkOS();

      await expect(workos.get('/organizations')).rejects.toMatchObject({
        status: 404,
      });

      expect(exchanges).toHaveLength(1);
      expect(apiRequests).toHaveLength(1);
    });
  });

  describe('shared in-flight exchange', () => {
    it('runs one exchange for concurrent first requests', async () => {
      const { exchanges, apiRequests } = mockServers();
      const { workos, tokenSource } = createWorkOS();

      await Promise.all([
        workos.get('/organizations'),
        workos.get('/organizations'),
        workos.post('/organizations', { name: 'Acme' }),
      ]);

      expect(tokenSource).toHaveBeenCalledTimes(1);
      expect(exchanges).toHaveLength(1);
      expect(
        apiRequests.map((request) => request.headers.get('authorization')),
      ).toEqual([
        'Bearer access-token-1',
        'Bearer access-token-1',
        'Bearer access-token-1',
      ]);
    });

    it('runs one exchange when concurrent requests all get a 401', async () => {
      const { exchanges, apiRequests } = mockServers({
        api: (request) =>
          request.headers.get('authorization') === 'Bearer access-token-1'
            ? { status: 401, body: { message: 'Unauthorized' } }
            : { body: { id: 'org_1' } },
      });
      const { workos, tokenSource } = createWorkOS();

      const results = await Promise.all([
        workos.get('/organizations'),
        workos.get('/organizations'),
        workos.get('/organizations'),
      ]);

      expect(results.map((result) => result.data)).toEqual([
        { id: 'org_1' },
        { id: 'org_1' },
        { id: 'org_1' },
      ]);
      expect(tokenSource).toHaveBeenCalledTimes(2);
      expect(exchanges).toHaveLength(2);
      expect(apiRequests).toHaveLength(6);
    });

    it('does not discard a newer token for a late 401 on the old one', async () => {
      let rejected = 0;
      let releaseLate401 = () => {};
      const replacementInUse = new Promise<void>((resolve) => {
        releaseLate401 = resolve;
      });
      const { exchanges } = mockServers({
        api: async (request) => {
          if (
            request.headers.get('authorization') !== 'Bearer access-token-1'
          ) {
            releaseLate401();
            return { body: { id: 'org_1' } };
          }

          // The second 401 arrives only once the replacement token is in use.
          if (++rejected === 2) {
            await replacementInUse;
          }

          return { status: 401, body: { message: 'Unauthorized' } };
        },
      });
      const { workos } = createWorkOS();

      await Promise.all([
        workos.get('/organizations'),
        workos.get('/organizations'),
      ]);

      expect(rejected).toBe(2);
      expect(exchanges).toHaveLength(2);
    });
  });

  describe('a failed exchange', () => {
    it('surfaces the OAuth error code and description', async () => {
      const { exchanges, apiRequests } = mockServers({
        exchange: () => ({
          status: 400,
          body: {
            error: 'invalid_grant',
            error_description: 'The assertion is not valid.',
          },
        }),
      });
      const { workos } = createWorkOS();

      const error = await workos.get('/organizations').catch((e) => e);

      expect(error).toBeInstanceOf(OauthException);
      expect(error.status).toBe(400);
      expect(error.error).toBe('invalid_grant');
      expect(error.errorDescription).toBe('The assertion is not valid.');
      expect(error.message).toContain('invalid_grant');
      expect(error.message).toContain('The assertion is not valid.');
      expect(exchanges).toHaveLength(1);
      expect(apiRequests).toHaveLength(0);
    });

    it('is not remembered: the next request exchanges a fresh ID token', async () => {
      const { exchanges, apiRequests } = mockServers({
        exchange: (request) =>
          request.form.assertion === 'id-token-1'
            ? { status: 400, body: { error: 'invalid_grant' } }
            : {
                body: {
                  access_token: 'access-token-2',
                  token_type: 'Bearer',
                  expires_in: 300,
                },
              },
      });
      const { workos } = createWorkOS();

      await expect(workos.get('/organizations')).rejects.toBeInstanceOf(
        OauthException,
      );
      await workos.get('/organizations');

      expect(exchanges.map((request) => request.form.assertion)).toEqual([
        'id-token-1',
        'id-token-2',
      ]);
      expect(apiRequests[0].headers.get('authorization')).toBe(
        'Bearer access-token-2',
      );
    });

    it('reports a failure that is not an OAuth error by status', async () => {
      mockServers({
        exchange: () => ({ status: 503, body: { message: 'Unavailable' } }),
      });
      const { workos } = createWorkOS();

      const error = await workos.get('/organizations').catch((e) => e);

      expect(error).toBeInstanceOf(GenericServerException);
      expect(error.status).toBe(503);
    });

    it('passes a token source failure through unchanged', async () => {
      const { exchanges } = mockServers();
      const failure = new Error('No OIDC token is available in this job.');
      const { workos } = createWorkOS({
        tokenSource: () => Promise.reject(failure),
      });

      await expect(workos.get('/organizations')).rejects.toBe(failure);
      expect(exchanges).toHaveLength(0);
    });
  });

  describe('no token in errors', () => {
    const ID_TOKEN = 'eyJhbGciOiJSUzI1NiJ9.id-token-payload.id-token-signature';
    const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiJ9.access-payload.access-signature';
    const tokenSource = () => Promise.resolve(ID_TOKEN);

    let logs: jest.SpyInstance[];

    beforeEach(() => {
      logs = (['log', 'info', 'warn', 'error', 'debug'] as const).map(
        (method) => jest.spyOn(console, method).mockImplementation(() => {}),
      );
    });

    function expectNoTokens(error: unknown) {
      expect(error).toBeInstanceOf(Error);
      const text = errorText(error);
      expect(text).not.toContain(ID_TOKEN);
      expect(text).not.toContain(ACCESS_TOKEN);
      for (const log of logs) {
        expect(log).not.toHaveBeenCalled();
      }
    }

    it('redacts an ID token the token endpoint echoes back', async () => {
      mockServers({
        exchange: (request) => ({
          status: 400,
          body: {
            error: 'invalid_grant',
            error_description: `Rejected ${request.form.assertion}`,
            assertion: request.form.assertion,
          },
        }),
      });
      const { workos } = createWorkOS({ tokenSource });

      const error = await workos.get('/organizations').catch((e) => e);

      expect(error).toBeInstanceOf(OauthException);
      expect(error.errorDescription).toBe('Rejected [REDACTED]');
      expectNoTokens(error);
    });

    it('keeps the ID token out of a transport failure', async () => {
      // A transport that puts the request body, ID token included, in its error.
      const fetchFn: typeof globalThis.fetch = (_input, init) =>
        Promise.reject(new TypeError(`cannot send ${String(init?.body)}`));
      const workos = new WorkOS({
        fetchFn,
        workloadIdentity: {
          clientId: 'client_machine',
          tokenSource,
          tokenEndpoint: TOKEN_ENDPOINT,
        },
      });

      const error = await workos.get('/organizations').catch((e) => e);

      expect(error.message).toContain(
        'Workload identity token exchange failed: cannot send',
      );
      expect(error.message).toContain('assertion=[REDACTED]');
      expectNoTokens(error);
    });

    it('keeps the access token out of a malformed exchange response', async () => {
      mockServers({
        exchange: () => ({
          body: { access_token: ACCESS_TOKEN, token_type: 'mac' },
        }),
      });
      const { workos } = createWorkOS({ tokenSource });

      const error = await workos.get('/organizations').catch((e) => e);

      expect(error.message).toContain('did not return a Bearer token');
      expectNoTokens(error);
    });

    it('keeps both tokens out of an API error', async () => {
      mockServers({
        exchange: () => ({
          body: {
            access_token: ACCESS_TOKEN,
            token_type: 'Bearer',
            expires_in: 300,
          },
        }),
        api: () => ({ status: 401, body: { message: 'Unauthorized' } }),
      });
      const { workos } = createWorkOS({ tokenSource });

      const error = await workos.get('/organizations').catch((e) => e);

      expect(error).toBeInstanceOf(UnauthorizedException);
      expectNoTokens(error);
    });
  });

  describe('configuration', () => {
    const workloadIdentity: WorkloadIdentityOptions = {
      clientId: 'client_machine',
      tokenSource: () => Promise.resolve('id-token'),
      tokenEndpoint: TOKEN_ENDPOINT,
    };

    it('rejects an API key together with a workload identity', () => {
      expect(() => new WorkOS({ apiKey: 'sk_test', workloadIdentity })).toThrow(
        'either an API key or workloadIdentity',
      );
      expect(() => new WorkOS('sk_test', { workloadIdentity })).toThrow(
        'either an API key or workloadIdentity',
      );
    });

    it('ignores WORKOS_API_KEY from the environment', async () => {
      process.env.WORKOS_API_KEY = 'sk_from_env';
      const { apiRequests } = mockServers();
      const workos = new WorkOS({ workloadIdentity });

      await workos.get('/organizations');

      expect(workos.key).toBeUndefined();
      expect(apiRequests[0].headers.get('authorization')).toBe(
        'Bearer access-token-1',
      );
    });

    it('does not need a top-level clientId', () => {
      expect(() => new WorkOS({ workloadIdentity })).not.toThrow();
    });

    it.each([
      ['a relative URL', '/oauth2/token', 'must be a full URL'],
      [
        'plain http',
        'http://signin.example.com/oauth2/token',
        'must use https',
      ],
    ])(
      'rejects a token endpoint that is %s',
      (_case, tokenEndpoint, message) => {
        expect(
          () =>
            new WorkOS({
              workloadIdentity: { ...workloadIdentity, tokenEndpoint },
            }),
        ).toThrow(message);
      },
    );

    it('allows plain http to a loopback token endpoint', () => {
      expect(
        () =>
          new WorkOS({
            workloadIdentity: {
              ...workloadIdentity,
              tokenEndpoint: 'http://localhost:7000/oauth2/token',
            },
          }),
      ).not.toThrow();
    });

    it('rejects a missing client ID', () => {
      expect(
        () =>
          new WorkOS({
            workloadIdentity: { ...workloadIdentity, clientId: '' },
          }),
      ).toThrow('workloadIdentity.clientId is required');
    });
  });
});
