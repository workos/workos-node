export interface UserManagementAuthorizationURLOptions {
  clientId: string;
  /**
   * PKCE code challenge for public clients.
   * Generate using workos.pkce.generate() and pass the codeChallenge here.
   */
  codeChallenge?: string;
  /** PKCE code challenge method. Use 'S256' (recommended). */
  codeChallengeMethod?: 'S256';
  connectionId?: string;
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

/**
 * Result of getAuthorizationUrlWithPKCE() containing the URL,
 * state, and PKCE code verifier.
 *
 * The codeVerifier must be stored securely and passed to
 * authenticateWithCode() during token exchange.
 */
export interface PKCEAuthorizationURLResult {
  /** The complete authorization URL to redirect the user to */
  url: string;
  /** The state parameter (auto-generated) */
  state: string;
  /** The PKCE code verifier. Store securely and pass to authenticateWithCode(). */
  codeVerifier: string;
}
