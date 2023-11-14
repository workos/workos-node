export interface AuthenticateWithCodeOptions {
  clientId: string;
  code: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticateUserWithCodeCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateWithCodeOptions {
  grant_type: 'authorization_code';
  client_id: string;
  client_secret: string | undefined;
  code: string;
  ip_address?: string;
  user_agent?: string;
}
