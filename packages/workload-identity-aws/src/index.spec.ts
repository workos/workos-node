// @oagen-ignore-file
import { GetWebIdentityTokenCommand, STSClient } from '@aws-sdk/client-sts';
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

  beforeEach(() => {
    // No region from the machine running the tests.
    process.env = {
      ...OLD_ENV,
      AWS_CONFIG_FILE: '/nonexistent/aws/config',
      AWS_SHARED_CREDENTIALS_FILE: '/nonexistent/aws/credentials',
    };
    delete process.env.AWS_REGION;
    delete process.env.AWS_DEFAULT_REGION;
    delete process.env.AWS_PROFILE;
  });

  afterEach(() => {
    process.env = OLD_ENV;
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

  it('requires an audience', () => {
    expect(() => awsSts('')).toThrow('an audience is required');
  });
});
