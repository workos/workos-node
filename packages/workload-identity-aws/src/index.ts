// @oagen-ignore-file
import { GetWebIdentityTokenCommand, STSClient } from '@aws-sdk/client-sts';

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * An identity token provider for AWS. Each call asks STS for a signed token
 * (`sts:GetWebIdentityToken`, RS256) that represents the calling role.
 *
 * One call is one STS request, with a 10-second limit on connecting and on
 * the request. The AWS SDK's own retries are off: the WorkOS SDK calls the
 * provider again when it retries the exchange.
 *
 * AWS credentials come from the AWS SDK's default chain. The account needs
 * outbound identity federation enabled, and the role needs permission for
 * `sts:GetWebIdentityToken`.
 *
 * @param audience - The audience the token is requested for. It must match
 * the audience of the trust rule, conventionally `https://api.workos.com`.
 * @param region - The AWS region whose STS endpoint is called. Defaults to
 * the region the AWS SDK resolves (`AWS_REGION`, then the shared config
 * file). The call fails when there is none.
 *
 * @example
 * new WorkloadIdentityCredentials({
 *   clientId: 'client_123',
 *   tokenUrl: 'https://auth.example.com/oauth2/token',
 *   identityTokenProvider: awsSts('https://api.workos.com', 'us-east-1'),
 * });
 */
export function awsSts(
  audience: string,
  region?: string,
): () => Promise<string> {
  if (!audience) {
    throw new TypeError('awsSts: an audience is required.');
  }

  // Built once. STS does not serve this call from its global endpoint, so the
  // client is held to the regional endpoint of its region.
  const client = new STSClient({
    ...(region && { region }),
    useGlobalEndpoint: false,
    // One attempt, whatever `AWS_MAX_ATTEMPTS` or the shared config file
    // says. The AWS SDK would otherwise send up to three requests per call.
    maxAttempts: 1,
    // Limits for this client only. Without them the AWS SDK sets none that
    // would end a request to an STS that stalls.
    requestHandler: {
      connectionTimeout: REQUEST_TIMEOUT_MS,
      // From sending the request until the response headers arrive. It only
      // logs a warning unless it is told to throw.
      requestTimeout: REQUEST_TIMEOUT_MS,
      throwOnRequestTimeout: true,
      // A response that goes silent after its headers.
      socketTimeout: REQUEST_TIMEOUT_MS,
    },
  });

  return async () => {
    // The AWS SDK resolves the region on first use, so a missing region
    // surfaces here and not when the provider is built.
    const resolved = await client.config.region().catch(() => undefined);

    if (!resolved || resolved === 'aws-global') {
      throw new Error(
        'awsSts: no AWS region. Pass a region or set AWS_REGION; sts:GetWebIdentityToken needs a regional STS endpoint.',
      );
    }

    let token: string | undefined;

    try {
      const response = await client.send(
        new GetWebIdentityTokenCommand({
          Audience: [audience],
          SigningAlgorithm: 'RS256',
        }),
      );
      token = response.WebIdentityToken;
    } catch (error) {
      // AWS service errors carry their code as the error name.
      const code = error instanceof Error ? error.name : 'UnknownError';

      throw new Error(`sts:GetWebIdentityToken failed with ${code}.`, {
        cause: error,
      });
    }

    if (!token) {
      throw new Error('sts:GetWebIdentityToken returned no token.');
    }

    return token;
  };
}
