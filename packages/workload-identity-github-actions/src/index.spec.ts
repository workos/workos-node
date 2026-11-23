// @oagen-ignore-file
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { githubActions } from './index';

const AUDIENCE = 'https://api.workos.com';

interface Received {
  method: string;
  url: string;
  headers: http.IncomingHttpHeaders;
}

describe('githubActions', () => {
  const OLD_ENV = process.env;
  const servers: http.Server[] = [];

  /** A local stand-in for the runner's OIDC endpoint. */
  async function listen(
    respond: (res: http.ServerResponse) => void,
  ): Promise<{ baseUrl: string; received: Received[] }> {
    const received: Received[] = [];
    const server = http.createServer((req, res) => {
      received.push({
        method: req.method ?? '',
        url: req.url ?? '',
        headers: req.headers,
      });
      respond(res);
    });
    servers.push(server);
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const { port } = server.address() as AddressInfo;

    return { baseUrl: `http://127.0.0.1:${port}`, received };
  }

  const json =
    (status: number, body: unknown) => (res: http.ServerResponse) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
    process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN = 'gha-request-token';
  });

  afterEach(async () => {
    process.env = OLD_ENV;
    for (const server of servers.splice(0)) {
      server.closeAllConnections();
      await new Promise((done) => server.close(done));
    }
  });

  it('WIF-GHA-01: requests a token for the audience with the request token and returns its value', async () => {
    const { baseUrl, received } = await listen(json(200, { value: 'gha-jwt' }));
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL = `${baseUrl}/token?api-version=2.0`;

    await expect(githubActions(AUDIENCE)()).resolves.toBe('gha-jwt');

    expect(received).toHaveLength(1);
    expect(received[0].method).toBe('GET');
    expect(received[0].url).toBe(
      '/token?api-version=2.0&audience=https%3A%2F%2Fapi.workos.com',
    );
    expect(received[0].headers.authorization).toBe('Bearer gha-request-token');
    expect(received[0].headers.accept).toBe('application/json');
  });

  it('WIF-GHA-02: missing environment variables fail with the permission hint', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const { baseUrl, received } = await listen(json(200, { value: 'gha-jwt' }));
    const provider = githubActions(AUDIENCE);

    // No request URL.
    await expect(provider()).rejects.toThrow('permissions: id-token: write');

    // No request token.
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL = `${baseUrl}/token?api-version=2.0`;
    delete process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
    await expect(provider()).rejects.toThrow('permissions: id-token: write');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(received).toHaveLength(0);
  });

  it('reads the environment on every call', async () => {
    const { baseUrl } = await listen(json(200, { value: 'gha-jwt' }));
    const provider = githubActions(AUDIENCE);

    await expect(provider()).rejects.toThrow('permissions: id-token: write');

    process.env.ACTIONS_ID_TOKEN_REQUEST_URL = `${baseUrl}/token`;
    await expect(provider()).resolves.toBe('gha-jwt');
  });

  it('adds a query string when the request URL has none', async () => {
    const { baseUrl, received } = await listen(json(200, { value: 'gha-jwt' }));
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL = `${baseUrl}/token`;

    await githubActions('api://workos/a b')();

    expect(received[0].url).toBe('/token?audience=api%3A%2F%2Fworkos%2Fa%20b');
  });

  it('fails on a status other than 200, naming the status', async () => {
    const { baseUrl } = await listen(json(404, { message: 'not found' }));
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL = `${baseUrl}/token`;

    await expect(githubActions(AUDIENCE)()).rejects.toThrow('status 404');
  });

  it.each([
    ['no value', json(200, {})],
    ['an empty value', json(200, { value: '' })],
    [
      'a body that is not JSON',
      (res: http.ServerResponse) => res.writeHead(200).end('gha-jwt'),
    ],
  ])(
    'fails on a response with %s, without quoting it',
    async (_name, respond) => {
      const { baseUrl } = await listen(respond);
      process.env.ACTIONS_ID_TOKEN_REQUEST_URL = `${baseUrl}/token`;

      const error = await githubActions(AUDIENCE)().catch((e) => e);

      expect(error.message).toBe(
        'The GitHub Actions OIDC token response did not include a token.',
      );
    },
  );

  it('does not follow a redirect', async () => {
    const target = await listen(json(200, { value: 'redirected-jwt' }));
    const { baseUrl } = await listen((res) =>
      res.writeHead(302, { location: `${target.baseUrl}/token` }).end(),
    );
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL = `${baseUrl}/token`;

    await expect(githubActions(AUDIENCE)()).rejects.toThrow('status 302');
    expect(target.received).toHaveLength(0);
  });

  it('requires an audience', () => {
    expect(() => githubActions('')).toThrow('an audience is required');
  });
});
