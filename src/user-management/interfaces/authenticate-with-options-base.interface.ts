export interface AuthenticateWithOptionsBase {
  clientId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SerializedAuthenticateWithOptionsBase {
  client_id: string;
  client_secret: string | undefined;
  ip_address?: string;
  user_agent?: string;
}
