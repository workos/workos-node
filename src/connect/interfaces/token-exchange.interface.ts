export interface ExchangeTokenOptions {
  /**
   * The OpenID issuer of the environment, e.g. `https://auth.example.com` or
   * `https://<env>.authkit.app`. The exchange is performed against
   * `${issuer}/oauth2/token`.
   */
  issuer: string;
  /** Client ID of the first-party Connect Application performing the exchange. */
  clientId: string;
  /** Client secret of that Connect Application. */
  clientSecret: string;
  /** The access token to exchange. */
  subjectToken: string;
  /** Resource Indicator the new access token should be issued for. */
  resource: string;
  /** Optional space-separated scopes to narrow the issued token to. */
  scope?: string;
}

export interface TokenExchangeResponse {
  accessToken: string;
  issuedTokenType: string;
  tokenType: string;
  expiresIn: number;
  scope?: string;
}

export interface TokenExchangeResponseResponse {
  access_token: string;
  issued_token_type: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}
