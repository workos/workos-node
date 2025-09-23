interface SSOAuthorizationURLBase {
  clientId: string;
  domainHint?: string;
  loginHint?: string;
  providerQueryParams?: Record<string, string | boolean | number>;
  providerScopes?: string[];
  redirectUri: string;
  state?: string;
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
