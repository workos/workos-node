export interface GetProfileAndTokenOptions {
  clientId: string;
  code: string;
  /**
   * PKCE code verifier for public clients.
   * Pass the codeVerifier that was generated with getAuthorizationUrlWithPKCE().
   * When provided, client_secret is not sent (public client mode).
   */
  codeVerifier?: string;
}
