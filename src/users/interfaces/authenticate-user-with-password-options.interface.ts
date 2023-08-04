export interface AuthenticateUserWithPasswordOptions {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
  startSession?: boolean;
  expiresIn?: number;
}

export interface SerializedAuthenticateUserWithPasswordOptions {
  email: string;
  password: string;
  ip_address?: string;
  user_agent?: string;
  start_session?: boolean;
  expires_in?: number;
}
