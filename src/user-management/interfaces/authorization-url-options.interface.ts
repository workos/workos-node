export interface AuthorizationURLOptions {
  clientId: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'S256';
  connectionId?: string;
  organizationId?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  redirectUri: string;
  state?: string;
  screenHint?: 'sign-up' | 'sign-in';
}
