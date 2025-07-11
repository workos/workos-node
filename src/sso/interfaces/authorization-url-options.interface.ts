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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuthorizationURLOptions extends SSOAuthorizationURLOptions {}
