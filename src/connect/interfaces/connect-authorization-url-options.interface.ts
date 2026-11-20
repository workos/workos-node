export interface ConnectAuthorizationURLOptions {
  /**
   * The OpenID issuer of the environment, e.g. `https://auth.example.com` or
   * `https://<env>.authkit.app`. The URL points at `${issuer}/oauth2/authorize`.
   */
  issuer: string;
  /** Client ID of the Connect Application. */
  clientId: string;
  /** The URL to redirect the user to after they authorize. */
  redirectUri: string;
  /** Space-separated scopes to request, e.g. `openid profile email offline_access`. */
  scope?: string;
  /** An opaque value returned unchanged to `redirectUri`. */
  state?: string;
  /** A random value echoed in the ID token to mitigate replay attacks. */
  nonce?: string;
  /**
   * The ID of the organization to scope the authorization to. The organization
   * picker is skipped; a user who isn't an active member of the organization
   * is redirected to `redirectUri` with `error=access_denied`.
   */
  organizationId?: string;
  /** Pre-fills the email address on the AuthKit sign-in page. */
  loginHint?: string;
  /** Space-separated `prompt` values, e.g. `login` or `consent`. */
  prompt?: string;
  /** Resource Indicator (RFC 8707) the access token should be issued for. */
  resource?: string;
  /** PKCE code challenge derived from a code verifier. */
  codeChallenge?: string;
  /** The PKCE code challenge method. Only `S256` is supported. */
  codeChallengeMethod?: 'S256';
}

export interface ConnectPKCEAuthorizationURLResult {
  /** The authorization URL to redirect the user to. */
  url: string;
  /** The generated `state` value. Verify it on the callback. */
  state: string;
  /** The PKCE code verifier. Store it and send it when exchanging the code. */
  codeVerifier: string;
}
