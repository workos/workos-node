export interface AuthorizationURLOptions {
  clientId: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'S256';
  connectionId?: string;
  /**
   *  @deprecated We previously required initiate login endpoints to return the `context`
   *  query parameter when getting the authorization URL. This is no longer necessary.
   */
  context?: string;
  organizationId?: string;
  domainHint?: string;
  loginHint?: string;
  provider?: string;
  redirectUri: string;
  state?: string;
  screenHint?: 'sign-up' | 'sign-in';
}
