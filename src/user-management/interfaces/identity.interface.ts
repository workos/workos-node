export interface Identity {
  idpId: string;
  type: 'OAuth';
  provider: 'AppleOAuth' | 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth';
}

export interface IdentityResponse {
  idp_id: string;
  type: 'OAuth';
  provider: 'AppleOAuth' | 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth';
}
