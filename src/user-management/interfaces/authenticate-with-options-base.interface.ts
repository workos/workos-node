export interface AuthenticateWithSessionOptions {
  cookiePassword?: string;
  sealSession: boolean;
}

export interface AuthenticateWithOptionsBase {
  clientId: string;
  ipAddress?: string;
  userAgent?: string;
  session?: AuthenticateWithSessionOptions;
}

export interface SerializedAuthenticateWithOptionsBase {
  client_id: string;
  client_secret: string | undefined;
  ip_address?: string;
  user_agent?: string;
}
