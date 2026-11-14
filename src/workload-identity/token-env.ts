// @oagen-ignore-file
import { getEnv } from '../common/utils/env';
import type { IdentityTokenProvider } from './workload-identity-credentials';

/**
 * An identity token provider that reads the token from an environment
 * variable on every call.
 *
 * @example
 * new WorkloadIdentityCredentials({
 *   clientId: 'client_123',
 *   tokenUrl: 'https://auth.example.com/oauth2/token',
 *   identityTokenProvider: tokenEnv('MY_PLATFORM_JWT'),
 * });
 */
export function tokenEnv(name: string): IdentityTokenProvider {
  return async () => {
    const token = getEnv(name)?.trim();

    if (!token) {
      throw new Error(
        `The environment variable ${name} is not set or is empty.`,
      );
    }

    return token;
  };
}
