// @oagen-ignore-file
import { GetWebIdentityTokenCommand, STSClient } from '@aws-sdk/client-sts';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { awsSts } from './index';

const AUDIENCE = 'https://api.workos.com';

interface StsCall {
  client: STSClient;
  command: GetWebIdentityTokenCommand;
  region: string;
  endpoint: string;
}

describe('awsSts', () => {
  const OLD_ENV = process.env;
  const servers: http.Server[] = [];

  /**
   * Stubs the one STS method the provider calls. The client itself is real,
   * so its region and endpoint are what a live call would use. Nothing here
   * reaches AWS.
   */
  function stubSts(respond: () => unknown): StsCall[] {
    const calls: StsCall[] = [];

    (
      jest.spyOn(STSClient.prototype, 'send') as unknown as jest.SpyInstance
    ).mockImplementation(async function (
      this: STSClient,
      command: GetWebIdentityTokenCommand,
    ) {
      const region = await this.config.region();
      const useGlobalEndpoint = this.config.useGlobalEndpoint;
      const endpoint = this.config.endpointProvider({
        Region: region,
        UseGlobalEndpoint:
          typeof useGlobalEndpoint === 'function'
            ? await useGlobalEndpoint()
            : useGlobalEndpoint,
        UseFIPS: false,
        UseDualStack: false,
      });

      calls.push({
        client: this,
        command,
        region,
        endpoint: endpoint.url.hostname,
      });

      return respond();
    });

    return calls;
  }

  /**
   * A local stand-in for the regional STS endpoint, for the tests that let
   * the provider's own client send its request. The client reaches it through
   * `AWS_ENDPOINT_URL_STS`, with its own retry and timeout settings. Nothing
   * here reaches AWS.
   */
  async function stsEndpoint(
    respond: (res: http.ServerResponse) => void,
  ): Promise<{ requests: () => number }> {
    let requests = 0;
    const server = http.createServer((req, res) => {
      requests++;
      req.resume();
      respond(res);
    });
    servers.push(server);
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const { port } = server.address() as AddressInfo;

    process.env.AWS_ENDPOINT_URL_STS = `http://127.0.0.1:${port}`;
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key-id';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-access-key';

    return { requests: () => requests };
  }

  const xml = (status: number, body: string) => (res: http.ServerResponse) => {
    res.writeHead(status, { 'content-type': 'text/xml' });
    res.end(body);
  };

  const stsError = (status: number, code: string) =>
    xml(
      status,
      `<ErrorResponse xmlns="https://sts.amazonaws.com/doc/2011-06-15/"><Error><Type>Sender</Type><Code>${code}</Code><Message>${code}</Message></Error><RequestId>request-1</RequestId></ErrorResponse>`,
    );

  beforeEach(() => {
    // No region, credentials or retry settings from the machine running the
    // tests.
    process.env = {
      ...OLD_ENV,
      AWS_CONFIG_FILE: '/nonexistent/aws/config',
      AWS_SHARED_CREDENTIALS_FILE: '/nonexistent/aws/credentials',
    };
    for (const name of [
      'AWS_REGION',
      'AWS_DEFAULT_REGION',
      'AWS_PROFILE',
      'AWS_SESSION_TOKEN',
      'AWS_MAX_ATTEMPTS',
      'AWS_RETRY_MODE',
      'AWS_ENDPOINT_URL',
      'AWS_ENDPOINT_URL_STS',
    ]) {
      delete process.env[name];
    }
  });

  afterEach(async () => {
    jest.useRealTimers();
    process.env = OLD_ENV;
    for (const server of servers.splice(0)) {
      server.closeAllConnections();
      await new Promise((done) => server.close(done));
    }
  });

  it('WIF-AWS-01: calls GetWebIdentityToken with the audience and RS256 on a regional endpoint and returns the token', async () => {
    const calls = stubSts(() => ({ WebIdentityToken: 'aws-jwt' }));

    await expect(awsSts(AUDIENCE, 'us-east-1')()).resolves.toBe('aws-jwt');

    expect(calls).toHaveLength(1);
    expect(calls[0].command).toBeInstanceOf(GetWebIdentityTokenCommand);
    // No DurationSeconds: STS applies its default.
    expect(calls[0].command.input).toEqual({
      Audience: [AUDIENCE],
      SigningAlgorithm: 'RS256',
    });
    expect(calls[0].region).toBe('us-east-1');
    expect(calls[0].endpoint).toBe('sts.us-east-1.amazonaws.com');

    // With no region available, the first call is an error and STS is never
    // called.
    await expect(awsSts(AUDIENCE)()).rejects.toThrow('no AWS region');
    expect(calls).toHaveLength(1);
  });

  it('WIF-AWS-02: an STS error surfaces as a provider error naming the call', async () => {
    const denied = Object.assign(
      new Error(
        'User: arn:aws:sts::123456789012:assumed-role/app/i-0abc is not authorized to perform: sts:GetWebIdentityToken',
      ),
      { name: 'AccessDenied' },
    );
    stubSts(() => {
      throw denied;
    });

    const error = await awsSts(AUDIENCE, 'us-east-1')().catch((e) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(
      'sts:GetWebIdentityToken failed with AccessDenied.',
    );
    expect(error.cause).toBe(denied);
  });

  it('uses the region the AWS SDK resolves when none is passed', async () => {
    process.env.AWS_REGION = 'eu-west-1';
    const calls = stubSts(() => ({ WebIdentityToken: 'aws-jwt' }));

    await expect(awsSts(AUDIENCE)()).resolves.toBe('aws-jwt');

    expect(calls[0].region).toBe('eu-west-1');
    expect(calls[0].endpoint).toBe('sts.eu-west-1.amazonaws.com');
  });

  it('refuses the global STS endpoint', async () => {
    const calls = stubSts(() => ({ WebIdentityToken: 'aws-jwt' }));

    await expect(awsSts(AUDIENCE, 'aws-global')()).rejects.toThrow(
      'no AWS region',
    );
    expect(calls).toHaveLength(0);
  });

  it('builds the STS client once', async () => {
    const calls = stubSts(() => ({ WebIdentityToken: 'aws-jwt' }));
    const provider = awsSts(AUDIENCE, 'us-east-1');

    await provider();
    await provider();

    expect(calls).toHaveLength(2);
    expect(calls[1].client).toBe(calls[0].client);
  });

  it('fails when STS returns no token', async () => {
    stubSts(() => ({}));

    await expect(awsSts(AUDIENCE, 'us-east-1')()).rejects.toThrow(
      'sts:GetWebIdentityToken returned no token.',
    );
  });

  it.each([
    ['throttles', 400, 'Throttling'],
    ['answers 503', 503, 'ServiceUnavailable'],
  ])(
    'makes one STS request per call when STS %s',
    async (_name, status, code) => {
      const sts = await stsEndpoint(stsError(status, code));

      await expect(awsSts(AUDIENCE, 'us-east-1')()).rejects.toThrow(
        `sts:GetWebIdentityToken failed with ${code}.`,
      );

      // The AWS SDK would send three. The exchange calls the provider again
      // when it retries, so the provider does not.
      expect(sts.requests()).toBe(1);
    },
  );

  it('sets one attempt and 10-second limits on its own STS client, whatever the environment says', async () => {
    process.env.AWS_MAX_ATTEMPTS = '5';
    const send = jest.spyOn(STSClient.prototype, 'send');
    const sts = await stsEndpoint(
      xml(
        200,
        '<GetWebIdentityTokenResponse xmlns="https://sts.amazonaws.com/doc/2011-06-15/"><GetWebIdentityTokenResult><WebIdentityToken>aws-jwt</WebIdentityToken></GetWebIdentityTokenResult></GetWebIdentityTokenResponse>',
      ),
    );

    await expect(awsSts(AUDIENCE, 'us-east-1')()).resolves.toBe('aws-jwt');

    const client = send.mock.contexts[0] as STSClient;
    // The settings the client's HTTP handler used for that request.
    const handler = client.config.requestHandler as unknown as {
      httpHandlerConfigs(): Record<string, unknown>;
    };

    expect(sts.requests()).toBe(1);
    await expect(client.config.maxAttempts()).resolves.toBe(1);
    expect(handler.httpHandlerConfigs()).toMatchObject({
      connectionTimeout: 10_000,
      requestTimeout: 10_000,
      throwOnRequestTimeout: true,
      socketTimeout: 10_000,
    });
  });

  it('gives up after 10 seconds on an STS that accepts the request and does not answer', async () => {
    const sts = await stsEndpoint(() => undefined);

    jest.useFakeTimers({
      doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'],
    });
    const turns = async (condition: () => boolean) => {
      for (let turn = 0; turn < 1000 && !condition(); turn++) {
        await new Promise((done) => setImmediate(done));
      }
    };

    let outcome: unknown = 'pending';
    void awsSts(AUDIENCE, 'us-east-1')().then(
      () => (outcome = 'resolved'),
      (error: unknown) => (outcome = error),
    );
    await turns(() => sts.requests() === 1);
    expect(sts.requests()).toBe(1);

    await jest.advanceTimersByTimeAsync(9_999);
    await turns(() => outcome !== 'pending');
    expect(outcome).toBe('pending');

    await jest.advanceTimersByTimeAsync(1);
    await turns(() => outcome !== 'pending');
    expect(outcome).toMatchObject({
      message: 'sts:GetWebIdentityToken failed with TimeoutError.',
    });
    // Not sent again.
    expect(sts.requests()).toBe(1);
  });

  it('requires an audience', () => {
    expect(() => awsSts('')).toThrow('an audience is required');
  });
});
