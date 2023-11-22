export interface AuthenticateWithMagicAuthOptions {
  clientId: string;
  code: string;
  email: string;
  linkAuthorizationCode?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticateUserWithMagicAuthCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateWithMagicAuthOptions {
  grant_type: 'urn:workos:oauth:grant-type:magic-auth:code';
  client_id: string;
  client_secret: string | undefined;
  code: string;
  email: string;
  link_authorization_code?: string;
  ip_address?: string;
  user_agent?: string;
}
