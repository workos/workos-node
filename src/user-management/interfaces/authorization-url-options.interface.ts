/**
 * PKCE fields must be provided together or not at all.
 * Use workos.pkce.generate() to create a valid pair.
 */
type PKCEFields =
  | { codeChallenge?: never; codeChallengeMethod?: never }
  | { codeChallenge: string; codeChallengeMethod: 'S256' };

interface UserManagementAuthorizationURLBaseOptions {
  clientId: string;
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

export type UserManagementAuthorizationURLOptions =
  UserManagementAuthorizationURLBaseOptions & PKCEFields;

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
