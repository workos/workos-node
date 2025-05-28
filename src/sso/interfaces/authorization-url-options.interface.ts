export interface SSOAuthorizationURLOptions {
  clientId: string;
  connection?: string;
  organization?: string;

  /**
   * @deprecated Please use `organization` instead.
   */
  domain?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  redirectUri: string;
  state?: string;
}

/**
 * @deprecated Use SSOAuthorizationURLOptions instead
 */
// tslint:disable-next-line:no-empty-interface
export interface AuthorizationURLOptions extends SSOAuthorizationURLOptions {}
