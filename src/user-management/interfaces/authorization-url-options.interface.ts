export interface AuthorizationURLOptions {
  clientId: string;
  connectionId?: string;
  organizationId?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  redirectUri: string;
  state?: string;
  screenHint?: 'sign-up' | 'sign-in';
}
