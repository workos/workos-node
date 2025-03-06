export interface AuthorizationURLOptions {
  clientId: string;
  connection?: string;
  organization?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  redirectUri: string;
  state?: string;
}
