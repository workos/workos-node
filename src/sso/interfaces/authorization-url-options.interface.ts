/**
 * PKCE fields must be provided together or not at all.
 * Use workos.pkce.generate() to create a valid pair.
 */
type PKCEFields =
  | { codeChallenge?: never; codeChallengeMethod?: never }
  | { codeChallenge: string; codeChallengeMethod: 'S256' };

interface SSOAuthorizationURLBaseFields {
  clientId: string;
  domainHint?: string;
  loginHint?: string;
  providerQueryParams?: Record<string, string | boolean | number>;
  providerScopes?: string[];
  redirectUri: string;
  state?: string;
}

/**
 * Result of getAuthorizationUrlWithPKCE() containing the URL,
 * state, and PKCE code verifier.
 *
 * The codeVerifier must be stored securely and passed to
 * getProfileAndToken() during token exchange.
 */
export interface SSOPKCEAuthorizationURLResult {
  /** The complete authorization URL to redirect the user to */
  url: string;
  /** The state parameter (auto-generated) */
  state: string;
  /** The PKCE code verifier. Store securely and pass to getProfileAndToken(). */
  codeVerifier: string;
}

type SSOWithConnection = SSOAuthorizationURLBaseFields &
  PKCEFields & {
    connection: string;
    organization?: never;
    provider?: never;
  };

type SSOWithOrganization = SSOAuthorizationURLBaseFields &
  PKCEFields & {
    organization: string;
    connection?: never;
    provider?: never;
  };

type SSOWithProvider = SSOAuthorizationURLBaseFields &
  PKCEFields & {
    provider: string;
    connection?: never;
    organization?: never;
  };

export type SSOAuthorizationURLOptions =
  | SSOWithConnection
  | SSOWithOrganization
  | SSOWithProvider;
