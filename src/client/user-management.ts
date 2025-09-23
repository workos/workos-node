import { toQueryString } from './utils';

// Re-export necessary interfaces for client use
export interface AuthorizationURLOptions {
  clientId: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'S256';
  connectionId?: string;
  /**
   *  @deprecated We previously required initiate login endpoints to return the `context`
   *  query parameter when getting the authorization URL. This is no longer necessary.
   */
  context?: string;
  organizationId?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  providerQueryParams?: Record<string, string | boolean | number>;
  providerScopes?: string[];
  prompt?: string;
  redirectUri: string;
  state?: string;
  screenHint?: 'sign-up' | 'sign-in';
}

export interface LogoutURLOptions {
  sessionId: string;
  returnTo?: string;
}

/**
 * Generates the authorization URL for OAuth client authentication.
 * Suitable for PKCE flows and other OAuth client operations that don't require an API key.
 *
 * @param options - Authorization URL options
 * @returns The authorization URL as a string
 * @throws TypeError if required arguments are missing
 */
export function getAuthorizationUrl(
  options: AuthorizationURLOptions & { baseURL?: string },
): string {
  const {
    connectionId,
    codeChallenge,
    codeChallengeMethod,
    context,
    clientId,
    domainHint,
    loginHint,
    organizationId,
    provider,
    providerQueryParams,
    providerScopes,
    prompt,
    redirectUri,
    state,
    screenHint,
    baseURL = 'https://api.workos.com',
  } = options;

  if (!provider && !connectionId && !organizationId) {
    throw new TypeError(
      `Incomplete arguments. Need to specify either a 'connectionId', 'organizationId', or 'provider'.`,
    );
  }

  if (provider !== 'authkit' && screenHint) {
    throw new TypeError(
      `'screenHint' is only supported for 'authkit' provider`,
    );
  }

  if (context) {
    console.warn(
      `WorkOS: \`context\` is deprecated. We previously required initiate login endpoints to return the
\`context\` query parameter when getting the authorization URL. This is no longer necessary.`,
    );
  }

  const query = toQueryString({
    connection_id: connectionId,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    context,
    organization_id: organizationId,
    domain_hint: domainHint,
    login_hint: loginHint,
    provider,
    provider_query_params: providerQueryParams,
    provider_scopes: providerScopes,
    prompt,
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    screen_hint: screenHint,
  });

  return `${baseURL}/user_management/authorize?${query}`;
}

/**
 * Generates the logout URL for ending a user session.
 * This method is safe to use in browser environments as it doesn't require an API key.
 *
 * @param options - Logout URL options
 * @returns The logout URL as a string
 * @throws TypeError if sessionId is not provided
 */
export function getLogoutUrl(
  options: LogoutURLOptions & { baseURL?: string },
): string {
  const { sessionId, returnTo, baseURL = 'https://api.workos.com' } = options;

  if (!sessionId) {
    throw new TypeError(`Incomplete arguments. Need to specify 'sessionId'.`);
  }

  const url = new URL('/user_management/sessions/logout', baseURL);

  url.searchParams.set('session_id', sessionId);
  if (returnTo) {
    url.searchParams.set('return_to', returnTo);
  }

  return url.toString();
}

/**
 * Gets the JWKS (JSON Web Key Set) URL for a given client ID.
 * Does not require an API key, returns the public JWKS endpoint.
 *
 * @param clientId - The WorkOS client ID
 * @param baseURL - Optional base URL for the API (defaults to https://api.workos.com)
 * @returns The JWKS URL as a string
 * @throws TypeError if clientId is not provided
 */
export function getJwksUrl(
  clientId: string,
  baseURL = 'https://api.workos.com',
): string {
  if (!clientId) {
    throw new TypeError('clientId must be a valid clientId');
  }

  return `${baseURL}/sso/jwks/${clientId}`;
}
