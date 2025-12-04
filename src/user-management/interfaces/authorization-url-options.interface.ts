export interface UserManagementAuthorizationURLOptions {
  clientId: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'S256';
  connectionId?: string;
  organizationId?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  providerQueryParams?: Record<string, string | boolean | number>;
  providerScopes?: string[];
  prompt?: string;
  redirectUri: string;
  state?: string;
  screenHint?: 'sign-up' | 'sign-in';
}
