export interface AuthenticateUserWithMagicAuthOptions {
  clientId: string;
  code: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticateUserWithMagicAuthCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateUserWithMagicAuthOptions {
  grant_type: 'urn:workos:oauth:grant-type:magic-auth:code';
  client_id: string;
  client_secret: string | undefined;
  code: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
}
