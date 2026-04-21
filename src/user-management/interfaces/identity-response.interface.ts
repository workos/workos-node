interface RawIdentityResponse {
  idp_id: string;
  type: 'OAuth';
  provider:
    | 'AppleOAuth'
    | 'GithubOAuth'
    | 'GitHubOAuth'
    | 'GoogleOAuth'
    | 'MicrosoftOAuth'
    | 'SalesforceOAuth';
}

export type { RawIdentityResponse };
