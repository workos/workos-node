export interface Identity {
  idpId: string;
  type: 'OAuth';
  provider:
    | 'AppleOAuth'
    | 'GoogleOAuth'
    | 'GitHubOAuth'
    | 'MicrosoftOAuth'
    | 'SalesforceOAuth';
}
