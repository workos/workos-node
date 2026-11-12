// @oagen-ignore-file
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { gcpMetadata } from './index';

const AUDIENCE = 'https://api.workos.com';
const METADATA_HOST = 'http://metadata.google.internal';

interface Received {
  method: string;
  url: string;
  headers: http.IncomingHttpHeaders;
}

describe('gcpMetadata', () => {
  const servers: http.Server[] = [];
  let requested: string[];

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

  /**
   * Points the metadata host at a local server. The provider has no setting
   * for its base URL, so the test moves the host under it: the request the
   * provider builds is sent unchanged apart from the origin, and anything
   * that is not for the metadata host fails the test.
   */
  async function metadataServer(respond: (res: http.ServerResponse) => void) {
    const mock = await listen(respond);
    const realFetch = globalThis.fetch;

    jest.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      requested.push(url);

      if (!url.startsWith(`${METADATA_HOST}/`)) {
        throw new Error(`Unexpected request to ${url}`);
      }

      return realFetch(mock.baseUrl + url.slice(METADATA_HOST.length), init);
    });

    return mock;
  }

  const text = (status: number, body: string) => (res: http.ServerResponse) => {
    res.writeHead(status, { 'content-type': 'text/plain' });
    res.end(body);
  };

  beforeEach(() => {
    requested = [];
  });

  afterEach(async () => {
    for (const server of servers.splice(0)) {
      server.closeAllConnections();
      await new Promise((done) => server.close(done));
    }
  });

  it('WIF-GCP-01: requests an identity token for the audience from the metadata server and returns the body', async () => {
    const { received } = await metadataServer(text(200, 'gcp-jwt\n'));

    await expect(gcpMetadata(AUDIENCE)()).resolves.toBe('gcp-jwt');

    expect(requested).toEqual([
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=https%3A%2F%2Fapi.workos.com&format=full',
    ]);
    expect(received).toHaveLength(1);
    expect(received[0].method).toBe('GET');
    expect(received[0].url).toBe(
      '/computeMetadata/v1/instance/service-accounts/default/identity?audience=https%3A%2F%2Fapi.workos.com&format=full',
    );
    expect(received[0].headers['metadata-flavor']).toBe('Google');
  });

  it('WIF-GCP-02: a non-200 response or an empty body is an error, and no redirect is followed', async () => {
    await metadataServer(text(404, 'not found'));
    await expect(gcpMetadata(AUDIENCE)()).rejects.toThrow('status 404');

    jest.restoreAllMocks();
    await metadataServer(text(200, ' \n'));
    await expect(gcpMetadata(AUDIENCE)()).rejects.toThrow('empty token');

    jest.restoreAllMocks();
    const target = await listen(text(200, 'redirected-jwt'));
    const { received } = await metadataServer((res) =>
      res.writeHead(302, { location: `${target.baseUrl}/identity` }).end(),
    );
    await expect(gcpMetadata(AUDIENCE)()).rejects.toThrow('status 302');
    expect(received).toHaveLength(1);
    expect(target.received).toHaveLength(0);
  });

  it('percent-encodes the audience', async () => {
    const { received } = await metadataServer(text(200, 'gcp-jwt'));

    await gcpMetadata('api://workos/a b&c')();

    expect(received[0].url).toBe(
      '/computeMetadata/v1/instance/service-accounts/default/identity?audience=api%3A%2F%2Fworkos%2Fa%20b%26c&format=full',
    );
  });

  it('requires an audience', () => {
    expect(() => gcpMetadata('')).toThrow('an audience is required');
  });
});
