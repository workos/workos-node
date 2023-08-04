export interface AuthenticateUserWithTokenOptions {
  clientId: string;
  code: string;
  expiresIn?: number;
}

export interface AuthenticateUserWithTokenCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateUserWithTokenOptions {
  grant_type: 'authorization_code';
  client_id: string;
  client_secret: string | undefined;
  code: string;
  expires_in?: number;
}
