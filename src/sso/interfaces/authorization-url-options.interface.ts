export interface AuthorizationURLOptions {
  clientID: string;
  connection?: string;
  organization?: string;

  /**
   * @deprecated Please use `organization` instead.
   */
  domain?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  redirectURI: string;
  state?: string;
}
