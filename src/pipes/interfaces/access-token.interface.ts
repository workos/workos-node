export interface AccessToken {
  token: string;
  expiresAt: Date | null;
  scopes: string[];
  missingScopes: string[];
}

export interface SerializedAccessToken {
  accessToken: string;
  expiresAt: string | null;
  scopes: string[];
  missingScopes: string[];
}
