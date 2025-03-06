export interface SSOAuthorizationURLOptions {
  clientId: string;
  connection?: string;
  organization?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  providerQueryParams?: Record<string, string | boolean | number>;
  providerScopes?: string[];
  redirectUri: string;
  state?: string;
}

/**
 * @deprecated Use SSOAuthorizationURLOptions instead
 */
// tslint:disable-next-line:no-empty-interface
export interface AuthorizationURLOptions extends SSOAuthorizationURLOptions {}
