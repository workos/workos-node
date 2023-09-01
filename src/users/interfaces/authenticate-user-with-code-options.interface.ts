export interface AuthenticateUserWithCodeOptions {
  clientId: string;
  code: string;
}

export interface AuthenticateUserWithCodeCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateUserWithCodeOptions {
  grant_type: 'authorization_code';
  client_id: string;
  client_secret: string | undefined;
  code: string;
}
