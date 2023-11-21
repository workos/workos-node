export interface AuthorizationURLOptions {
  clientId: string;
  connectionId?: string;
  organizationId?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  redirectURI: string;
  state?: string;
}
