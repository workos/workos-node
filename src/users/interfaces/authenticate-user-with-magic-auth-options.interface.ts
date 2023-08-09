export interface AuthenticateUserWithMagicAuthOptions {
  clientId: string;
  code: string;
  magicAuthChallengeId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresIn?: number;
}

export interface AuthenticateUserWithMagicAuthCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateUserWithMagicAuthOptions {
  grant_type: 'urn:workos:oauth:grant-type:magic-auth:code';
  client_id: string;
  client_secret: string | undefined;
  code: string;
  magic_auth_challenge_id: string;
  ip_address?: string;
  user_agent?: string;
  expires_in?: number;
}
