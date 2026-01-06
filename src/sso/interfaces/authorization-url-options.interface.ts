interface SSOAuthorizationURLBase {
  clientId: string;
  /**
   * PKCE code challenge for public clients.
   * Generate using workos.pkce.generate() and pass the codeChallenge here.
   */
  codeChallenge?: string;
  /** PKCE code challenge method. Use 'S256' (recommended). */
  codeChallengeMethod?: 'S256';
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

interface SSOWithConnection extends SSOAuthorizationURLBase {
  connection: string;
  organization?: never;
  provider?: never;
}

interface SSOWithOrganization extends SSOAuthorizationURLBase {
  organization: string;
  connection?: never;
  provider?: never;
}

interface SSOWithProvider extends SSOAuthorizationURLBase {
  provider: string;
  connection?: never;
  organization?: never;
}

export type SSOAuthorizationURLOptions =
  | SSOWithConnection
  | SSOWithOrganization
  | SSOWithProvider;
