export interface AuthenticateUserWithTokenOptions {
  clientId: string;
  code: string;
  startSession?: boolean;
  expiresIn?: number;
}

export interface AuthenticateUserWithTokenCredentials {
  clientSecret: string | undefined;
  grantType: string;
}

export interface SerializedAuthenticateUserWithTokenOptions {
  client_id: string;
  client_secret: string | undefined;
  code: string;
  grant_type: string;
  start_session?: boolean;
  expires_in?: number;
}
