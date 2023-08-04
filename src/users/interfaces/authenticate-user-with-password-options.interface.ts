export interface AuthenticateUserWithPasswordOptions {
  clientId: string;
  email: string;
  password: string;
  ip_address?: string;
  user_agent?: string;
  start_session?: boolean;
  expires_in?: number;
}
