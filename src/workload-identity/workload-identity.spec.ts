// @oagen-ignore-file
import fetch from 'jest-fetch-mock';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { inspect } from 'node:util';
import { version } from '../../package.json';
import { sealData } from '../common/crypto/seal';
import {
  ApiKeyRequiredException,
  UnauthorizedException,
} from '../common/exceptions';
import userFixture from '../user-management/fixtures/user.json';
import {
  tokenEnv,
  tokenFile,
  WorkloadIdentityCredentials,
  WorkloadIdentityCredentialsOptions,
  WorkloadIdentityError,
  WorkOS,
} from '../index';
import { WorkOS as WorkOSWorker } from '../index.worker';
import type { WorkloadIdentityInternals } from './workload-identity-credentials';

// The conformance cases in the WIF plan (WIF-01 to WIF-24). Each case ID is
// in the name of at least one test below. Shared `describe` names carry no
// ID, because the conformance check reads the full test name.

const CLIENT_ID = 'client_wif_test';
const ENVIRONMENT_ID = 'environment_wif_test';
const TOKEN_URL = 'https://auth.workos.test/oauth2/token';
const GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

interface RecordedRequest {
  url: string;
  method: string;
  headers: Headers;
  body: string;
}

interface Reply {
  status?: number;
  json?: unknown;
  text?: string;
  headers?: Record<string, string>;
}

/** Called with the 1-based count of requests the mock has received. */
type Responder = (
  count: number,
  request: RecordedRequest,
) => Reply | Promise<Reply>;

// The mock token endpoint and the mock WorkOS API.
let exchanges: RecordedRequest[];
let apiRequests: RecordedRequest[];
let issued: number;
let tokenEndpoint: Responder;
let api: Responder;

/** The success response: `access-1`, then `access-2`, one per exchange. */
const issueToken = (fields: Record<string, unknown> = {}): Reply => ({
  json: {
    access_token: `access-${++issued}`,
    token_type: 'Bearer',
    expires_in: 300,
    ...fields,
  },
});

const oauthError = (code: string, description = `${code} description`) => ({
  status: 400,
  json: { error: code, error_description: description },
});

const unauthorized = (): Reply => ({
  status: 401,
  json: { message: 'Unauthorized' },
});

const form = (request: RecordedRequest) =>
  Object.fromEntries(new URLSearchParams(request.body));

const bearer = (request: RecordedRequest) =>
  request.headers.get('authorization');

const noSleep = () => Promise.resolve();

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}

async function waitFor(condition: () => boolean) {
  for (let turn = 0; turn < 1000 && !condition(); turn++) {
    await new Promise((done) => setImmediate(done));
  }
  expect(condition()).toBe(true);
}

function setup(
  options: Partial<WorkloadIdentityCredentialsOptions> = {},
  internals: WorkloadIdentityInternals = {},
) {
  const provider = jest.fn(async () => 'assertion-1');
  const credentials = new WorkloadIdentityCredentials(
    {
      clientId: CLIENT_ID,
      tokenUrl: TOKEN_URL,
      environmentId: ENVIRONMENT_ID,
      identityTokenProvider: provider,
      ...options,
    },
    { sleep: noSleep, ...internals },
  );
  const workos = new WorkOS({ credentials });

  return { provider, credentials, workos };
}

describe('workload identity', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    for (const name of ['WORKOS_API_KEY', 'WORKOS_CLIENT_ID']) {
      delete process.env[name];
    }

    exchanges = [];
    apiRequests = [];
    issued = 0;
    tokenEndpoint = () => issueToken();
    api = () => ({ json: { ok: true } });

    fetch.resetMocks();
    fetch.mockResponse(async (request) => {
      const recorded: RecordedRequest = {
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: await request.text(),
      };
      const isExchange = request.url.endsWith('/oauth2/token');
      const received = isExchange ? exchanges : apiRequests;
      received.push(recorded);

      const reply = await (isExchange ? tokenEndpoint : api)(
        received.length,
        recorded,
      );

      return {
        status: reply.status ?? 200,
        body: reply.text ?? JSON.stringify(reply.json ?? {}),
        headers: {
          'content-type':
            reply.text === undefined ? 'application/json' : 'text/plain',
          ...reply.headers,
        },
      };
    });
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('exchange', () => {
    it('WIF-01: the first request sends one exchange POST with the jwt-bearer form', async () => {
      const { workos } = setup();

      await workos.get('/organizations');

      expect(exchanges).toHaveLength(1);
      expect(exchanges[0].url).toBe(TOKEN_URL);
      expect(exchanges[0].method).toBe('POST');
      expect(exchanges[0].headers.get('content-type')).toBe(
        'application/x-www-form-urlencoded',
      );
      expect(form(exchanges[0])).toEqual({
        grant_type: GRANT_TYPE,
        assertion: 'assertion-1',
        client_id: CLIENT_ID,
        resource: 'https://api.workos.com',
      });
      expect(exchanges[0].headers.has('authorization')).toBe(false);

      const scoped = setup({ scope: 'orgs:write' });

      await scoped.workos.get('/organizations');

      expect(exchanges).toHaveLength(2);
      expect(form(exchanges[1])).toEqual({
        grant_type: GRANT_TYPE,
        assertion: 'assertion-1',
        client_id: CLIENT_ID,
        resource: 'https://api.workos.com',
        scope: 'orgs:write',
      });
      expect(form(exchanges[1])).not.toHaveProperty('client_secret');
      expect(exchanges[1].headers.has('authorization')).toBe(false);
    });

    it('WIF-02: (a) with an environment ID the API request carries the access token and the environment header', async () => {
      const { workos } = setup();

      await expect(workos.get('/organizations')).resolves.toEqual({
        data: { ok: true },
      });

      expect(apiRequests).toHaveLength(1);
      expect(apiRequests[0].url).toBe('https://api.workos.com/organizations');
      expect(bearer(apiRequests[0])).toBe('Bearer access-1');
      expect(apiRequests[0].headers.get('x-url-environment-id')).toBe(
        ENVIRONMENT_ID,
      );
    });

    it('WIF-02: (b) with no environment ID the API request carries the access token and no environment header', async () => {
      // The SDK does not read this variable. `afterEach` restores it.
      process.env.WORKOS_ENVIRONMENT_ID = 'environment_env';

      let built!: ReturnType<typeof setup>;
      expect(() => {
        built = setup({ environmentId: undefined });
      }).not.toThrow();

      await expect(built.workos.get('/organizations')).resolves.toEqual({
        data: { ok: true },
      });

      expect(apiRequests).toHaveLength(1);
      expect(bearer(apiRequests[0])).toBe('Bearer access-1');
      expect(apiRequests[0].headers.has('x-url-environment-id')).toBe(false);
    });

    it.each([
      ['an empty', ''],
      ['a null', null],
    ])(
      'WIF: %s environmentId counts as not set and sends no environment header',
      async (_name, environmentId) => {
        await setup({
          environmentId,
        } as Partial<WorkloadIdentityCredentialsOptions>).workos.get(
          '/organizations',
        );

        expect(bearer(apiRequests[0])).toBe('Bearer access-1');
        expect(apiRequests[0].headers.has('x-url-environment-id')).toBe(false);
      },
    );

    it('WIF-18: the exchange does not follow a redirect', async () => {
      // Real HTTP: a mocked fetch never follows a redirect, so it could not
      // tell whether the exchange would.
      const nativeFetch = (globalThis as Record<string, unknown>)
        .__workosNativeFetch as typeof globalThis.fetch;

      const listen = async (handler: http.RequestListener) => {
        const server = http.createServer(handler);
        await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
        const { port } = server.address() as AddressInfo;
        return { server, url: `http://127.0.0.1:${port}/oauth2/token` };
      };

      const targetRequests: string[] = [];
      const target = await listen((req, res) => {
        targetRequests.push(req.method ?? '');
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ access_token: 'access-redirected' }));
      });

      const tokenRequests: string[] = [];
      const token = await listen((req, res) => {
        tokenRequests.push(req.method ?? '');
        res.writeHead(307, { location: target.url });
        res.end();
      });

      // The local servers speak plain HTTP and the credentials take only an
      // https token URL, with no setting that relaxes it. So the test moves
      // the token endpoint under them: the request the SDK builds is sent
      // unchanged apart from the address, and a request for anything other
      // than the token URL fails the test.
      const requested: string[] = [];
      fetch.mockImplementation(async (input, init) => {
        requested.push(String(input));

        if (input !== TOKEN_URL) {
          throw new Error(`Unexpected request to ${String(input)}`);
        }

        return nativeFetch(token.url, init);
      });

      try {
        const credentials = new WorkloadIdentityCredentials({
          clientId: CLIENT_ID,
          tokenUrl: TOKEN_URL,
          environmentId: ENVIRONMENT_ID,
          identityTokenProvider: async () => 'assertion-1',
        });

        const error = await credentials.resolve().catch((e) => e);

        expect(error).toBeInstanceOf(WorkloadIdentityError);
        expect(error.code).toBe('exchange_failed');
        expect(requested).toEqual([TOKEN_URL]);
        expect(tokenRequests).toEqual(['POST']);
        expect(targetRequests).toEqual([]);
      } finally {
        for (const { server } of [token, target]) {
          server.closeAllConnections();
          await new Promise((done) => server.close(done));
        }
      }
    });

    it('WIF: a redirect reported by the runtime as status 0 or 3xx is an exchange failure', async () => {
      tokenEndpoint = () => ({ status: 302, text: '' });
      const { credentials } = setup();

      await expect(credentials.resolve()).rejects.toMatchObject({
        code: 'exchange_failed',
      });
      expect(exchanges).toHaveLength(1);
      expect(fetch.mock.calls[0][1]).toMatchObject({ redirect: 'manual' });
    });

    it.each([
      ['a 200 that is not JSON', { text: 'not json' }],
      ['a 200 with no access token', { json: { token_type: 'Bearer' } }],
      ['a 404 with no OAuth error', { status: 404, json: {} }],
    ])(
      'WIF: %s is an invalid response and is not retried',
      async (_name, reply) => {
        tokenEndpoint = () => reply;
        const { workos } = setup();

        await expect(workos.get('/organizations')).rejects.toMatchObject({
          name: 'WorkloadIdentityError',
          code: 'invalid_response',
        });
        expect(exchanges).toHaveLength(1);
        expect(apiRequests).toHaveLength(0);
      },
    );
  });

  describe('cache and refresh', () => {
    it('WIF-03: a second request within the token lifetime reuses the cached token', async () => {
      const { workos } = setup();

      await workos.get('/organizations');
      await workos.get('/organizations');

      expect(exchanges).toHaveLength(1);
      expect(apiRequests.map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-1',
      ]);
    });

    it('WIF-04: with expires_in 300 the token is refreshed when less than 60 seconds remain', async () => {
      let now = 0;
      const { workos } = setup({}, { now: () => now });

      await workos.get('/organizations');

      now = 239_000;
      await workos.get('/organizations');
      expect(exchanges).toHaveLength(1);

      now = 241_000;
      await workos.get('/organizations');
      expect(exchanges).toHaveLength(2);
      expect(bearer(apiRequests[2])).toBe('Bearer access-2');
    });

    it('WIF-05: with expires_in 100 the refresh threshold is 20 seconds, not 60', async () => {
      let now = 0;
      tokenEndpoint = () => issueToken({ expires_in: 100 });
      const { workos } = setup({}, { now: () => now });

      await workos.get('/organizations');

      now = 79_000;
      await workos.get('/organizations');
      expect(exchanges).toHaveLength(1);

      now = 81_000;
      await workos.get('/organizations');
      expect(exchanges).toHaveLength(2);
    });

    it('WIF-06: a response with no expires_in is treated as 300 seconds', async () => {
      let now = 0;
      tokenEndpoint = () => issueToken({ expires_in: undefined });
      const { workos } = setup({}, { now: () => now });

      await workos.get('/organizations');

      now = 239_000;
      await workos.get('/organizations');
      expect(exchanges).toHaveLength(1);

      now = 241_000;
      await workos.get('/organizations');
      expect(exchanges).toHaveLength(2);
    });

    it('WIF-07: two credentials instances never share a cached token', async () => {
      const first = setup();
      const second = setup();

      await first.workos.get('/organizations');
      await second.workos.get('/organizations');

      expect(exchanges).toHaveLength(2);
      expect(apiRequests.map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-2',
      ]);
    });

    it('WIF-11: a late 401 for an old generation does not discard a newer token', async () => {
      const { credentials, workos } = setup();

      const first = await credentials.resolve();
      expect(first.headers.Authorization).toBe('Bearer access-1');

      credentials.invalidate(first.generation);
      const second = await credentials.resolve();
      expect(second.headers.Authorization).toBe('Bearer access-2');
      expect(second.generation).not.toBe(first.generation);

      // The late 401 names the generation its request was sent with.
      credentials.invalidate(first.generation);

      await workos.get('/organizations');

      expect((await credentials.resolve()).generation).toBe(second.generation);
      expect(exchanges).toHaveLength(2);
      expect(bearer(apiRequests[0])).toBe('Bearer access-2');
    });
  });

  describe('shared exchange', () => {
    it('WIF-08: 20 concurrent first requests on one instance produce exactly one exchange', async () => {
      const release = deferred();
      tokenEndpoint = async () => {
        await release.promise;
        return issueToken();
      };
      const { provider, workos } = setup();

      const requests = Array.from({ length: 20 }, () =>
        workos.get('/organizations'),
      );

      // The endpoint holds its response until every caller is waiting on it.
      await waitFor(() => exchanges.length === 1);
      expect(apiRequests).toHaveLength(0);
      release.resolve();

      await Promise.all(requests);

      expect(exchanges).toHaveLength(1);
      expect(provider).toHaveBeenCalledTimes(1);
      expect(apiRequests).toHaveLength(20);
      expect(new Set(apiRequests.map(bearer))).toEqual(
        new Set(['Bearer access-1']),
      );
    });

    it('WIF-16: after a failed exchange the next request starts a fresh exchange', async () => {
      tokenEndpoint = (count) =>
        count === 1 ? oauthError('invalid_grant') : issueToken();
      const { workos } = setup();

      await expect(workos.get('/organizations')).rejects.toBeInstanceOf(
        WorkloadIdentityError,
      );
      await expect(workos.get('/organizations')).resolves.toEqual({
        data: { ok: true },
      });

      expect(exchanges).toHaveLength(2);
      expect(apiRequests.map(bearer)).toEqual(['Bearer access-1']);
    });

    it('WIF-23: aborting one waiting caller does not cancel the shared exchange', async () => {
      const release = deferred();
      tokenEndpoint = async () => {
        await release.promise;
        return issueToken();
      };
      const { credentials } = setup();
      const abort = new AbortController();

      const callerA = credentials.resolve({ signal: abort.signal });
      const callerB = credentials.resolve();
      await waitFor(() => exchanges.length === 1);

      abort.abort();
      await expect(callerA).rejects.toMatchObject({ name: 'AbortError' });

      release.resolve();

      await expect(callerB).resolves.toMatchObject({
        headers: { Authorization: 'Bearer access-1' },
      });
      expect(exchanges).toHaveLength(1);
    });

    it('WIF-23: a request that times out while waiting does not cancel the shared exchange', async () => {
      const release = deferred();
      tokenEndpoint = async () => {
        await release.promise;
        return issueToken();
      };
      const { credentials } = setup();
      const impatient = new WorkOS({ credentials, timeout: 20, maxRetries: 0 });
      const patient = new WorkOS({ credentials });

      // Caller A starts the exchange, then gives up on its own deadline.
      const callerA = impatient.get('/organizations');
      await waitFor(() => exchanges.length === 1);
      const callerB = patient.get('/organizations');

      await expect(callerA).rejects.toMatchObject({ status: 408 });

      release.resolve();

      await expect(callerB).resolves.toEqual({ data: { ok: true } });
      expect(exchanges).toHaveLength(1);
      expect(apiRequests.map(bearer)).toEqual(['Bearer access-1']);
    });
  });

  describe('401 recovery', () => {
    it('WIF-09: a 401 invalidates that token generation, exchanges again and retries once', async () => {
      api = (count) => (count === 1 ? unauthorized() : { json: { ok: true } });
      const { workos } = setup();

      await expect(workos.get('/organizations')).resolves.toEqual({
        data: { ok: true },
      });

      expect(exchanges).toHaveLength(2);
      expect(apiRequests.map(bearer)).toEqual([
        'Bearer access-1',
        'Bearer access-2',
      ]);
    });

    it('WIF-10: a second 401 after recovery is returned to the caller', async () => {
      api = () => unauthorized();
      const { workos } = setup();

      await expect(workos.get('/organizations')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(exchanges).toHaveLength(2);
      expect(apiRequests).toHaveLength(2);
    });

    it('WIF-12: transport retries inside one request do not reset the single 401 recovery', async () => {
      api = (count) => {
        if (count === 2) {
          return {
            status: 503,
            json: { message: 'Unavailable' },
            headers: { 'Retry-After': '0' },
          };
        }
        return count <= 3 ? unauthorized() : { json: { ok: true } };
      };
      const { workos } = setup();

      await expect(workos.get('/organizations')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(exchanges).toHaveLength(2);
      expect(apiRequests).toHaveLength(3);
    });

    it('WIF-13: the 401 retry sends the same body and the same idempotency key', async () => {
      api = (count) => (count === 1 ? unauthorized() : { json: { ok: true } });
      const { workos } = setup();

      await workos.post('/organizations', {
        name: 'Acme',
        domains: ['a.test'],
      });

      expect(apiRequests).toHaveLength(2);
      const [first, second] = apiRequests;
      expect(first.body).toBe('{"name":"Acme","domains":["a.test"]}');
      expect(second.body).toBe(first.body);
      expect(first.headers.get('idempotency-key')).toBeTruthy();
      expect(second.headers.get('idempotency-key')).toBe(
        first.headers.get('idempotency-key'),
      );
      expect([bearer(first), bearer(second)]).toEqual([
        'Bearer access-1',
        'Bearer access-2',
      ]);
    });

    it('WIF: a per-request access token keeps its precedence and is not recovered', async () => {
      api = () => unauthorized();
      const { workos } = setup();

      await expect(
        workos.get('/sso/profile', { accessToken: 'user_access_token' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(exchanges).toHaveLength(0);
      expect(apiRequests).toHaveLength(1);
      expect(bearer(apiRequests[0])).toBe('Bearer user_access_token');
      expect(apiRequests[0].headers.has('x-url-environment-id')).toBe(false);
    });
  });

  describe('exchange retries', () => {
    it('WIF-14: the exchange is retried on 5xx and 429, calling the provider again each attempt', async () => {
      tokenEndpoint = (count) => {
        if (count === 1) {
          return { status: 503, text: 'unavailable' };
        }
        if (count === 2) {
          return {
            status: 429,
            json: { message: 'slow down' },
            headers: { 'Retry-After': '0' },
          };
        }
        return issueToken();
      };
      const { provider, workos } = setup();

      await expect(workos.get('/organizations')).resolves.toEqual({
        data: { ok: true },
      });

      expect(exchanges).toHaveLength(3);
      expect(provider).toHaveBeenCalledTimes(3);
      expect(bearer(apiRequests[0])).toBe('Bearer access-1');
    });

    it('WIF-14: the exchange is retried when the token endpoint cannot be reached', async () => {
      tokenEndpoint = (count) => {
        if (count === 1) {
          throw new TypeError('fetch failed');
        }
        return issueToken();
      };
      const { provider, workos } = setup();

      await expect(workos.get('/organizations')).resolves.toEqual({
        data: { ok: true },
      });

      expect(provider).toHaveBeenCalledTimes(2);
    });

    it('WIF-14: the exchange is retried when the provider fails', async () => {
      const provider = jest
        .fn<Promise<string>, []>()
        .mockRejectedValueOnce(new Error('metadata service unavailable'))
        .mockResolvedValueOnce('assertion-2');
      const { workos } = setup({ identityTokenProvider: provider });

      await expect(workos.get('/organizations')).resolves.toEqual({
        data: { ok: true },
      });

      expect(provider).toHaveBeenCalledTimes(2);
      expect(exchanges).toHaveLength(1);
      expect(form(exchanges[0]).assertion).toBe('assertion-2');
    });

    it('WIF-14: the exchange honors Retry-After', async () => {
      tokenEndpoint = (count) =>
        count === 1
          ? {
              status: 429,
              json: { message: 'slow down' },
              headers: { 'Retry-After': '1' },
            }
          : issueToken();
      const sleep = jest.fn<
        Promise<void>,
        [retryAttempt: number, retryAfterMs?: number | null]
      >(noSleep);
      const { workos } = setup({}, { sleep });

      await workos.get('/organizations');

      expect(exchanges).toHaveLength(2);
      expect(sleep).toHaveBeenCalledTimes(1);
      expect(sleep.mock.calls[0][1]).toBeGreaterThanOrEqual(1000);
    });

    it('WIF: an exchange that keeps failing surfaces the last failure', async () => {
      tokenEndpoint = () => ({
        status: 503,
        json: { error: 'temporarily_unavailable', error_description: 'busy' },
      });
      const { provider, workos } = setup();

      await expect(workos.get('/organizations')).rejects.toMatchObject({
        name: 'WorkloadIdentityError',
        code: 'temporarily_unavailable',
        description: 'busy',
      });

      // The SDK's default: one attempt and three retries.
      expect(exchanges).toHaveLength(4);
      expect(provider).toHaveBeenCalledTimes(4);
      expect(apiRequests).toHaveLength(0);
    });
  });

  describe('errors', () => {
    it.each([
      'invalid_grant',
      'invalid_target',
      'invalid_client',
      'unauthorized_client',
      'invalid_scope',
      'invalid_request',
    ])(
      'WIF-15: %s is not retried and surfaces as a typed error with the code',
      async (code) => {
        tokenEndpoint = () => oauthError(code, `the server said ${code}`);
        const { workos } = setup();

        const error = await workos.get('/organizations').catch((e) => e);

        expect(error).toBeInstanceOf(WorkloadIdentityError);
        expect(error.code).toBe(code);
        expect(error.description).toBe(`the server said ${code}`);
        expect(error.hint).not.toBe('');
        expect(error.message).toBe(
          `${code}: ${error.hint} the server said ${code}`,
        );
        expect(exchanges).toHaveLength(1);
        expect(apiRequests).toHaveLength(0);
      },
    );

    it('WIF-17: neither the assertion nor the access token appears in an error or a log line', async () => {
      const ASSERTION = 'SECRET-ASSERTION-VALUE';
      const ACCESS_TOKEN = 'SECRET-ACCESS-VALUE';

      const logged: unknown[][] = [];
      for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
        jest
          .spyOn(console, method)
          .mockImplementation((...args) => void logged.push(args));
      }
      jest
        .spyOn(process, 'emitWarning')
        .mockImplementation((...args) => void logged.push(args));

      const secretProvider = async () => ASSERTION;
      const errors: unknown[] = [];

      // An OAuth error from the exchange.
      tokenEndpoint = () => oauthError('invalid_grant');
      errors.push(
        await setup({ identityTokenProvider: secretProvider })
          .workos.get('/organizations')
          .catch((e) => e),
      );

      // A 500 from the token endpoint until the retries run out.
      tokenEndpoint = () => ({ status: 500, json: { message: 'boom' } });
      errors.push(
        await setup({ identityTokenProvider: secretProvider })
          .workos.get('/organizations')
          .catch((e) => e),
      );

      // A provider that raises.
      tokenEndpoint = () => issueToken();
      errors.push(
        await setup({
          identityTokenProvider: async () => {
            throw new Error('metadata service unavailable');
          },
        })
          .workos.get('/organizations')
          .catch((e) => e),
      );

      // A second 401 from the API.
      tokenEndpoint = () => issueToken({ access_token: ACCESS_TOKEN });
      api = () => unauthorized();
      errors.push(
        await setup({ identityTokenProvider: secretProvider })
          .workos.get('/organizations')
          .catch((e) => e),
      );

      expect(errors.map((error) => (error as Error).name)).toEqual([
        'WorkloadIdentityError',
        'WorkloadIdentityError',
        'WorkloadIdentityError',
        'UnauthorizedException',
      ]);
      // Both secrets did reach the mocks, so their absence below means
      // something.
      expect(exchanges.some((e) => e.body.includes(ASSERTION))).toBe(true);
      expect(apiRequests.map(bearer)).toContain(`Bearer ${ACCESS_TOKEN}`);

      const seen = [
        ...errors.flatMap((error) => [
          (error as Error).message,
          String(error),
          (error as Error).stack,
          inspect(error, { depth: null, showHidden: true }),
          JSON.stringify(error, Object.getOwnPropertyNames(error as object)),
        ]),
        inspect(logged, { depth: null }),
      ].join('\n');

      expect(seen).not.toContain(ASSERTION);
      expect(seen).not.toContain(ACCESS_TOKEN);
    });
  });

  describe('authentication precedence', () => {
    it('WIF-19: passing both an API key and credentials is a configuration error', async () => {
      const { credentials } = setup();

      expect(
        () => new WorkOS({ apiKey: 'sk_test_explicit', credentials }),
      ).toThrow('WorkOS accepts an API key or credentials, not both');
      expect(() => new WorkOS('sk_test_explicit', { credentials })).toThrow(
        'WorkOS accepts an API key or credentials, not both',
      );
      expect(
        () => new WorkOSWorker({ apiKey: 'sk_test_explicit', credentials }),
      ).toThrow('WorkOS accepts an API key or credentials, not both');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('WIF-20: explicit credentials win over WORKOS_API_KEY and a failing configuration never falls back to it', async () => {
      process.env.WORKOS_API_KEY = 'sk_test_env';

      // (a) Valid credentials.
      const valid = setup();
      await valid.workos.get('/organizations');
      expect(valid.workos.key).toBeUndefined();
      expect(bearer(apiRequests[0])).toBe('Bearer access-1');

      // (b) No token URL.
      const construct = () =>
        new WorkloadIdentityCredentials({
          clientId: CLIENT_ID,
          environmentId: ENVIRONMENT_ID,
          identityTokenProvider: async () => 'assertion-1',
        } as WorkloadIdentityCredentialsOptions);
      expect(construct).toThrow(WorkloadIdentityError);
      expect(construct).toThrow(
        /^invalid_configuration: Workload identity credentials are missing a required setting\. tokenUrl is required$/,
      );

      // (c) Valid credentials whose exchange fails.
      tokenEndpoint = () => oauthError('invalid_client');
      await expect(setup().workos.get('/organizations')).rejects.toMatchObject({
        name: 'WorkloadIdentityError',
        code: 'invalid_client',
      });

      expect(apiRequests).toHaveLength(1);
      for (const request of [...exchanges, ...apiRequests]) {
        expect(request.headers.get('authorization') ?? '').not.toContain(
          'sk_test_env',
        );
        expect(request.body).not.toContain('sk_test_env');
      }
    });

    it('WIF-24: a static API-key client is unchanged', async () => {
      const workos = new WorkOS('sk_test_static');

      await workos.get('/organizations');

      // The exact header set an API-key client sent before credentials
      // existed.
      expect(fetch.mock.calls[0][1]?.headers).toEqual({
        Accept: 'application/json, text/plain, */*',
        Authorization: 'Bearer sk_test_static',
        'Content-Type': 'application/json',
        'User-Agent': `workos-node/${version}`,
      });
      expect(apiRequests[0].headers.has('x-url-environment-id')).toBe(false);

      api = () => unauthorized();

      await expect(workos.get('/organizations')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      // One attempt for the 401: a static key has nothing to recover.
      expect(apiRequests).toHaveLength(2);
      expect(apiRequests.map(bearer)).toEqual([
        'Bearer sk_test_static',
        'Bearer sk_test_static',
      ]);
      expect(exchanges).toHaveLength(0);
    });

    it('WIF: the worker entry authorizes with credentials too', async () => {
      const { credentials } = setup();
      const workos = new WorkOSWorker({ credentials });

      await workos.get('/organizations');

      expect(bearer(apiRequests[0])).toBe('Bearer access-1');
      expect(apiRequests[0].headers.get('x-url-environment-id')).toBe(
        ENVIRONMENT_ID,
      );
    });

    it('WIF: the snapshot replaces an Authorization header from the client config, whatever its casing', async () => {
      const { credentials } = setup();
      const workos = new WorkOS({
        credentials,
        config: { headers: { authorization: 'Bearer from_config' } },
      });

      await workos.get('/organizations');

      expect(bearer(apiRequests[0])).toBe('Bearer access-1');
    });
  });

  describe('methods that send the API key as the client secret', () => {
    // The application users sign in to. It is not the workload identity
    // client.
    const APP_CLIENT_ID = 'client_app';
    const pending = {
      clientId: APP_CLIENT_ID,
      pendingAuthenticationToken: 'pending_token',
    };

    const needsApiKey = (method: string) =>
      `${method} needs an API key: this request sends it as the client secret. ` +
      'A client that authenticates with workload identity has no API key, ' +
      'so use a client built with one for this call.';

    // Every user management method that sends `client_secret`.
    // `authenticateWithCode` is here with and without a code verifier.
    const userManagementCalls: Array<
      [string, string, (workos: WorkOS) => Promise<unknown>]
    > = [
      [
        'authenticateWithPassword',
        'authenticateWithPassword',
        (workos) =>
          workos.userManagement.authenticateWithPassword({
            clientId: APP_CLIENT_ID,
            email: 'user@example.com',
            password: 'password',
          }),
      ],
      [
        'authenticateWithMagicAuth',
        'authenticateWithMagicAuth',
        (workos) =>
          workos.userManagement.authenticateWithMagicAuth({
            clientId: APP_CLIENT_ID,
            email: 'user@example.com',
            code: '123456',
          }),
      ],
      [
        'authenticateWithCode',
        'authenticateWithCode',
        (workos) =>
          workos.userManagement.authenticateWithCode({
            clientId: APP_CLIENT_ID,
            code: 'authorization_code',
          }),
      ],
      [
        'authenticateWithCode with a code verifier',
        'authenticateWithCode',
        (workos) =>
          workos.userManagement.authenticateWithCode({
            clientId: APP_CLIENT_ID,
            code: 'authorization_code',
            codeVerifier: 'code_verifier',
          }),
      ],
      [
        'authenticateWithRefreshToken',
        'authenticateWithRefreshToken',
        (workos) =>
          workos.userManagement.authenticateWithRefreshToken({
            clientId: APP_CLIENT_ID,
            refreshToken: 'refresh_token',
          }),
      ],
      [
        'authenticateWithTotp',
        'authenticateWithTotp',
        (workos) =>
          workos.userManagement.authenticateWithTotp({
            ...pending,
            code: '123456',
            authenticationChallengeId: 'auth_challenge_123',
          }),
      ],
      [
        'authenticateWithEmailVerification',
        'authenticateWithEmailVerification',
        (workos) =>
          workos.userManagement.authenticateWithEmailVerification({
            ...pending,
            code: '123456',
          }),
      ],
      [
        'authenticateWithOrganizationSelection',
        'authenticateWithOrganizationSelection',
        (workos) =>
          workos.userManagement.authenticateWithOrganizationSelection({
            ...pending,
            organizationId: 'org_123',
          }),
      ],
      [
        'authenticateWithRadarSmsChallenge',
        'authenticateWithRadarSmsChallenge',
        (workos) =>
          workos.userManagement.authenticateWithRadarSmsChallenge({
            ...pending,
            code: '123456',
            verificationId: 'verification_123',
            phoneNumber: '+15555550123',
          }),
      ],
      [
        'authenticateWithRadarEmailChallenge',
        'authenticateWithRadarEmailChallenge',
        (workos) =>
          workos.userManagement.authenticateWithRadarEmailChallenge({
            ...pending,
            code: '123456',
            radarChallengeId: 'radar_challenge_123',
          }),
      ],
    ];

    const authenticationResponse = (): Reply => ({
      json: {
        user: userFixture,
        access_token: 'user_access_token',
        refresh_token: 'user_refresh_token',
      },
    });

    const profileAndToken = (): Reply => ({
      json: {
        access_token: 'sso_access_token',
        profile: {
          object: 'profile',
          id: 'prof_123',
          idp_id: '123',
          organization_id: 'org_123',
          connection_id: 'conn_123',
          connection_type: 'OktaSAML',
          email: 'user@example.com',
          raw_attributes: {},
        },
      },
    });

    it.each(userManagementCalls)(
      'WIF: userManagement.%s throws before any request on a client built with credentials',
      async (_name, method, call) => {
        const { workos, provider } = setup();

        const error = await call(workos).catch((thrown: unknown) => thrown);

        expect(error).toBeInstanceOf(ApiKeyRequiredException);
        expect(error).toMatchObject({
          message: needsApiKey(method),
          path: '/user_management/authenticate',
        });
        // No exchange and no API request.
        expect(fetch).not.toHaveBeenCalled();
        expect(provider).not.toHaveBeenCalled();
      },
    );

    it.each([
      ['with no code verifier', undefined],
      ['with a code verifier', 'code_verifier'],
    ])(
      'WIF: sso.getProfileAndToken %s throws before any request on a client built with credentials',
      async (_name, codeVerifier) => {
        const { workos, provider } = setup();

        const error = await workos.sso
          .getProfileAndToken({
            clientId: APP_CLIENT_ID,
            code: 'authorization_code',
            codeVerifier,
          })
          .catch((thrown: unknown) => thrown);

        expect(error).toBeInstanceOf(ApiKeyRequiredException);
        expect(error).toMatchObject({
          message: needsApiKey('getProfileAndToken'),
          path: '/sso/token',
        });
        expect(fetch).not.toHaveBeenCalled();
        expect(provider).not.toHaveBeenCalled();
      },
    );

    it('WIF: refreshing a sealed session throws before any request on a client built with credentials', async () => {
      const { credentials, provider } = setup();
      const workos = new WorkOS({ clientId: APP_CLIENT_ID, credentials });
      const cookiePassword = 'a cookie password of at least 32 characters';
      const encode = (value: object) =>
        Buffer.from(JSON.stringify(value)).toString('base64url');
      const session = workos.userManagement.loadSealedSession({
        sessionData: await sealData(
          {
            // Decoded, never verified, before the refresh request.
            accessToken: `${encode({ alg: 'none' })}.${encode({ sid: 'session_123' })}.`,
            refreshToken: 'refresh_token',
            user: userFixture,
          },
          { password: cookiePassword },
        ),
        cookiePassword,
      });

      // Thrown, not reported as a failed refresh: the session is not over.
      const error = await session.refresh().catch((thrown: unknown) => thrown);

      expect(error).toBeInstanceOf(ApiKeyRequiredException);
      expect(error).toMatchObject({
        message: needsApiKey('authenticateWithRefreshToken'),
      });
      expect(fetch).not.toHaveBeenCalled();
      expect(provider).not.toHaveBeenCalled();
    });

    it('WIF: a public client still exchanges a code with a verifier and refreshes with no client secret', async () => {
      // Neither an API key nor credentials.
      const workos = new WorkOS({ clientId: APP_CLIENT_ID });

      api = (_count, request) =>
        request.url.endsWith('/sso/token')
          ? profileAndToken()
          : authenticationResponse();

      await expect(
        workos.userManagement.authenticateWithCode({
          code: 'authorization_code',
          codeVerifier: 'code_verifier',
        }),
      ).resolves.toMatchObject({ accessToken: 'user_access_token' });
      await expect(
        workos.userManagement.authenticateWithCodeAndVerifier({
          clientId: APP_CLIENT_ID,
          code: 'authorization_code',
          codeVerifier: 'code_verifier',
        }),
      ).resolves.toMatchObject({ accessToken: 'user_access_token' });
      await expect(
        workos.userManagement.authenticateWithRefreshToken({
          refreshToken: 'refresh_token',
        }),
      ).resolves.toMatchObject({ refreshToken: 'user_refresh_token' });
      await expect(
        workos.sso.getProfileAndToken({
          clientId: APP_CLIENT_ID,
          code: 'authorization_code',
          codeVerifier: 'code_verifier',
        }),
      ).resolves.toMatchObject({ accessToken: 'sso_access_token' });

      expect(
        apiRequests.map((request) => new URL(request.url).pathname),
      ).toEqual([
        '/user_management/authenticate',
        '/user_management/authenticate',
        '/user_management/authenticate',
        '/sso/token',
      ]);
      expect(JSON.parse(apiRequests[0].body)).toEqual({
        grant_type: 'authorization_code',
        client_id: APP_CLIENT_ID,
        code: 'authorization_code',
        code_verifier: 'code_verifier',
      });
      expect(JSON.parse(apiRequests[2].body)).toEqual({
        grant_type: 'refresh_token',
        client_id: APP_CLIENT_ID,
        refresh_token: 'refresh_token',
      });
      expect(form(apiRequests[3])).toEqual({
        grant_type: 'authorization_code',
        client_id: APP_CLIENT_ID,
        code: 'authorization_code',
        code_verifier: 'code_verifier',
      });
      for (const request of apiRequests) {
        expect(request.body).not.toContain('client_secret');
        expect(request.headers.has('authorization')).toBe(false);
      }
      expect(exchanges).toHaveLength(0);
    });

    it('WIF: a public client gets the same error as before from a method that needs an API key', async () => {
      const workos = new WorkOS({ clientId: APP_CLIENT_ID });

      const error = await workos.userManagement
        .authenticateWithPassword({
          email: 'user@example.com',
          password: 'password',
        })
        .catch((thrown: unknown) => thrown);

      expect(error).toBeInstanceOf(ApiKeyRequiredException);
      expect(error).toMatchObject({
        message: expect.stringMatching(
          /^API key required for "\/user_management\/authenticate"\. /,
        ),
        path: '/user_management/authenticate',
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('WIF: a client with an API key still sends it as the client secret', async () => {
      const workos = new WorkOS('sk_test_static', { clientId: APP_CLIENT_ID });

      api = (_count, request) =>
        request.url.endsWith('/sso/token')
          ? profileAndToken()
          : authenticationResponse();

      await workos.userManagement.authenticateWithPassword({
        email: 'user@example.com',
        password: 'password',
      });
      await workos.userManagement.authenticateWithCode({
        code: 'authorization_code',
        codeVerifier: 'code_verifier',
      });
      await workos.userManagement.authenticateWithRefreshToken({
        refreshToken: 'refresh_token',
      });
      await workos.sso.getProfileAndToken({
        clientId: APP_CLIENT_ID,
        code: 'authorization_code',
      });

      expect(
        apiRequests
          .slice(0, 3)
          .map((request) => JSON.parse(request.body).client_secret),
      ).toEqual(['sk_test_static', 'sk_test_static', 'sk_test_static']);
      expect(form(apiRequests[3]).client_secret).toBe('sk_test_static');
      expect(apiRequests.map(bearer)).toEqual(
        Array(4).fill('Bearer sk_test_static'),
      );
      expect(exchanges).toHaveLength(0);
    });
  });

  describe('providers and configuration', () => {
    it('WIF-21: tokenFile re-reads the file on every exchange', async () => {
      const directory = await mkdtemp(path.join(os.tmpdir(), 'workos-wif-'));
      const file = path.join(directory, 'token');
      let now = 0;

      try {
        await writeFile(file, 'assertion-1\n');
        const { workos } = setup(
          { identityTokenProvider: tokenFile(file) },
          { now: () => now },
        );

        await workos.get('/organizations');

        await writeFile(file, '  assertion-2\n');
        now = 241_000;
        await workos.get('/organizations');

        expect(exchanges.map((exchange) => form(exchange).assertion)).toEqual([
          'assertion-1',
          'assertion-2',
        ]);

        // An empty or missing file is a provider error.
        await writeFile(file, '\n');
        await expect(tokenFile(file)()).rejects.toThrow('is empty');
        await expect(
          tokenFile(path.join(directory, 'missing'))(),
        ).rejects.toThrow('could not be read');
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    });

    it('WIF-22: tokenEnv and callback providers supply the assertion, and only clientId defaults from the environment', async () => {
      // (a) tokenEnv reads the variable on every call.
      process.env.MY_JWT = 'assertion-env';
      await setup({
        identityTokenProvider: tokenEnv('MY_JWT'),
      }).workos.get('/organizations');
      expect(form(exchanges[0]).assertion).toBe('assertion-env');

      delete process.env.MY_JWT;
      await expect(tokenEnv('MY_JWT')()).rejects.toThrow(
        'The environment variable MY_JWT is not set or is empty.',
      );

      // (b) A callback is any function of the provider type.
      await setup({
        identityTokenProvider: async () => 'assertion-cb',
      }).workos.get('/organizations');
      expect(form(exchanges[1]).assertion).toBe('assertion-cb');

      // (c) A provider and the token URL: the client ID comes from the
      // environment. The SDK reads neither of the other two variables.
      process.env.WORKOS_CLIENT_ID = 'client_env';
      process.env.WORKOS_WIF_TOKEN_URL =
        'https://ignored.example.test/oauth2/token';
      process.env.WORKOS_WIF_SCOPE = 'scope_env';

      await new WorkOS({
        credentials: new WorkloadIdentityCredentials({
          tokenUrl: TOKEN_URL,
          identityTokenProvider: async () => 'assertion-1',
        }),
      }).get('/organizations');

      expect(exchanges[2].url).toBe(TOKEN_URL);
      expect(form(exchanges[2]).client_id).toBe('client_env');
      expect(form(exchanges[2])).not.toHaveProperty('scope');

      // (d) An explicit client ID wins over the variable.
      await new WorkOS({
        credentials: new WorkloadIdentityCredentials({
          clientId: CLIENT_ID,
          tokenUrl: TOKEN_URL,
          identityTokenProvider: async () => 'assertion-1',
        }),
      }).get('/organizations');

      expect(exchanges[3].url).toBe(TOKEN_URL);
      expect(form(exchanges[3]).client_id).toBe(CLIENT_ID);

      // (e) No token URL: the variable does not fill it.
      let error: WorkloadIdentityError | undefined;
      try {
        new WorkloadIdentityCredentials({
          identityTokenProvider: async () => 'assertion-1',
        } as WorkloadIdentityCredentialsOptions);
      } catch (e) {
        error = e as WorkloadIdentityError;
      }

      expect(error).toBeInstanceOf(WorkloadIdentityError);
      expect(error?.code).toBe('invalid_configuration');
      expect(error?.description).toBe('tokenUrl is required');
      expect(exchanges).toHaveLength(4);
    });

    it.each([
      [
        'clientId',
        { clientId: undefined },
        'clientId is required (or set WORKOS_CLIENT_ID)',
      ],
      ['tokenUrl', { tokenUrl: '' }, 'tokenUrl is required'],
      [
        'identityTokenProvider',
        { identityTokenProvider: undefined },
        'identityTokenProvider is required',
      ],
      [
        'a valid tokenUrl',
        { tokenUrl: 'not a url' },
        'tokenUrl must be an absolute https URL',
      ],
    ])(
      'WIF: credentials without %s fail at construction',
      (_name, overrides, description) => {
        const construct = () =>
          setup(overrides as Partial<WorkloadIdentityCredentialsOptions>);

        expect(construct).toThrow(WorkloadIdentityError);
        expect(construct).toThrow(description);
        expect(fetch).not.toHaveBeenCalled();
      },
    );
  });

  describe('edges', () => {
    it('WIF: the exchange goes to the token URL host even when its path starts with two slashes', async () => {
      const tokenUrl = 'https://auth.workos.test//oauth2/token';
      const { workos } = setup({ tokenUrl });

      await workos.get('/organizations');

      expect(exchanges.map((exchange) => exchange.url)).toEqual([tokenUrl]);
    });

    it.each([
      ['an http URL', 'http://example.com/oauth2/token'],
      ['an http URL on localhost', 'http://localhost:8080/oauth2/token'],
      ['an http URL on a loopback address', 'http://127.0.0.1/oauth2/token'],
      ['an http URL in upper case', 'HTTP://example.com/oauth2/token'],
      ['a URL with no scheme', 'auth.workos.test/oauth2/token'],
      [
        'a URL with no scheme and two slashes',
        '//auth.workos.test/oauth2/token',
      ],
      ['a path', '/oauth2/token'],
      ['an https URL with no host', 'https:///oauth2/token'],
      ['an https URL with one slash and no host', 'https:/oauth2/token'],
      ['an https URL with no slashes and no host', 'https:oauth2/token'],
      ['an https URL with nothing after the scheme', 'https://'],
      ['a URL with another scheme', 'file:///oauth2/token'],
      ['a WebSocket URL', 'wss://auth.workos.test/oauth2/token'],
      ['an https URL after a space', ' https://auth.workos.test/oauth2/token'],
    ])(
      'WIF: a token URL that is %s fails at construction',
      (_name, tokenUrl) => {
        let error: WorkloadIdentityError | undefined;
        try {
          setup({ tokenUrl });
        } catch (e) {
          error = e as WorkloadIdentityError;
        }

        expect(error).toBeInstanceOf(WorkloadIdentityError);
        expect(error?.code).toBe('invalid_configuration');
        expect(error?.description).toBe(
          'tokenUrl must be an absolute https URL',
        );
        expect(fetch).not.toHaveBeenCalled();
      },
    );

    it('WIF: a token URL with the https scheme in upper case is accepted', async () => {
      const { workos } = setup({
        tokenUrl: 'HTTPS://auth.workos.test/oauth2/token',
      });

      await workos.get('/organizations');

      expect(exchanges.map((exchange) => exchange.url)).toEqual([TOKEN_URL]);
    });

    it('WIF: tokenFile fails as a provider error in a runtime with no file system', async () => {
      jest
        .spyOn(process, 'getBuiltinModule')
        .mockReturnValue(undefined as never);

      const error = await tokenFile('/var/run/token')().catch((e) => e);

      expect(error.message).toBe(
        'The identity token file /var/run/token could not be read.',
      );
      expect(error.cause.message).toBe('This runtime has no file system.');
    });

    it('WIF: an exchange that outlives its 30-second deadline fails, and the next request starts a new one', async () => {
      // The first provider call never answers.
      const provider = jest
        .fn<Promise<string>, []>()
        .mockReturnValueOnce(new Promise(() => undefined))
        .mockResolvedValue('assertion-1');
      const { credentials } = setup({ identityTokenProvider: provider });

      jest.useFakeTimers({
        doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'],
      });

      try {
        const first = credentials.resolve().catch((e) => e);
        const joined = credentials.resolve().catch((e) => e);

        await jest.advanceTimersByTimeAsync(29_999);
        expect(provider).toHaveBeenCalledTimes(1);
        await jest.advanceTimersByTimeAsync(1);

        for (const error of [await first, await joined]) {
          expect(error).toBeInstanceOf(WorkloadIdentityError);
          expect(error.code).toBe('exchange_failed');
          expect(error.description).toBe(
            'The token exchange did not finish within 30 seconds.',
          );
        }
        expect(jest.getTimerCount()).toBe(0);
      } finally {
        jest.useRealTimers();
      }

      // The in-flight exchange was cleared, so this starts a new one.
      await expect(credentials.resolve()).resolves.toMatchObject({
        headers: { Authorization: 'Bearer access-1' },
      });
      expect(provider).toHaveBeenCalledTimes(2);
      expect(exchanges).toHaveLength(1);
    });

    it('WIF: a Retry-After longer than the time left is cut to the exchange deadline', async () => {
      tokenEndpoint = (count) =>
        count === 1
          ? {
              status: 429,
              json: { message: 'slow down' },
              headers: { 'Retry-After': '60' },
            }
          : issueToken();
      const sleep = jest.fn<
        Promise<void>,
        [retryAttempt: number, retryAfterMs?: number | null]
      >(noSleep);
      const { workos } = setup({}, { sleep });

      await workos.get('/organizations');

      expect(sleep).toHaveBeenCalledTimes(1);
      expect(sleep.mock.calls[0][1]).toBeLessThanOrEqual(30_000);
      expect(sleep.mock.calls[0][1]).toBeGreaterThan(25_000);
    });

    it('WIF: the server description is cut to 500 characters and an unknown code gets the general hint', async () => {
      tokenEndpoint = () => oauthError('server_made_this_up', 'x'.repeat(600));
      const { workos } = setup();

      const error = await workos.get('/organizations').catch((e) => e);

      expect(error).toBeInstanceOf(WorkloadIdentityError);
      expect(error.code).toBe('server_made_this_up');
      expect(error.description).toBe('x'.repeat(500));
      expect(error.hint).toBe('The token endpoint rejected the exchange.');
    });

    it.each([
      ['a string', 'soon'],
      ['zero', 0],
      ['a negative number', -5],
    ])(
      'WIF: an expires_in that is %s is treated as 300 seconds',
      async (_name, expiresIn) => {
        let now = 0;
        tokenEndpoint = () => issueToken({ expires_in: expiresIn });
        const { workos } = setup({}, { now: () => now });

        await workos.get('/organizations');

        now = 239_000;
        await workos.get('/organizations');
        expect(exchanges).toHaveLength(1);

        now = 241_000;
        await workos.get('/organizations');
        expect(exchanges).toHaveLength(2);
      },
    );
  });
});
