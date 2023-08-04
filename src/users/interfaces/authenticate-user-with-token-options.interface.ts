export interface AuthenticateUserWithTokenOptions {
  clientId: string;
  code: string;
  startSession?: boolean;
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
  start_session?: boolean;
  expires_in?: number;
}
