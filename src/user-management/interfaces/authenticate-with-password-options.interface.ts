export interface AuthenticateWithPasswordOptions {
  clientId: string;
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticateUserWithPasswordCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateWithPasswordOptions {
  grant_type: 'password';
  client_id: string;
  client_secret: string | undefined;
  email: string;
  password: string;
  ip_address?: string;
  user_agent?: string;
}
