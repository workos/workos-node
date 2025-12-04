import { toQueryString } from '../common/utils/query-string';
import type { SSOAuthorizationURLOptions as BaseSSOAuthorizationURLOptions } from '../sso/interfaces';

// Extend the base options to include baseURL for internal use
export type SSOAuthorizationURLOptions = BaseSSOAuthorizationURLOptions & {
  baseURL?: string;
};

/**
 * Generates the authorization URL for SSO authentication.
 * Does not require an API key, suitable for OAuth client operations.
 *
 * @param options - SSO authorization URL options
 * @returns The authorization URL as a string
 * @throws Error if required arguments are missing
 */
export function getAuthorizationUrl(
  options: SSOAuthorizationURLOptions,
): string {
  const {
    connection,
    clientId,
    domainHint,
    loginHint,
    organization,
    provider,
    providerQueryParams,
    providerScopes,
    redirectUri,
    state,
    baseURL = 'https://api.workos.com',
  } = options;

  if (!provider && !connection && !organization) {
    throw new Error(
      `Incomplete arguments. Need to specify either a 'connection', 'organization', or 'provider'.`,
    );
  }

  const query = toQueryString({
    connection,
    organization,
    domain_hint: domainHint,
    login_hint: loginHint,
    provider,
    provider_query_params: providerQueryParams,
    provider_scopes: providerScopes,
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });

  return `${baseURL}/sso/authorize?${query}`;
}
