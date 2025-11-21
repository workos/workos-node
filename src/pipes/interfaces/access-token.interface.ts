export interface AccessToken {
  object: 'access_token';
  accessToken: string;
  expiresAt: Date | null;
  scopes: string[];
  missingScopes: string[];
}

export interface SerializedAccessToken {
  object: 'access_token';
  access_token: string;
  expires_at: string | null;
  scopes: string[];
  missing_scopes: string[];
}
