export interface AuthenticateUserWithTotpOptions {
  clientId: string;
  code: string;
  pendingAuthenticationToken: string;
  authenticationChallengeId: string;
}

export interface AuthenticateUserWithTotpCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateUserWithTotpOptions {
  grant_type: 'urn:workos:oauth:grant-type:mfa-totp';
  client_id: string;
  client_secret: string | undefined;
  code: string;
  pending_authentication_token: string;
  authentication_challenge_id: string;
}
