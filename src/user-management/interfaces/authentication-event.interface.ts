interface AuthenticationEventError {
  code: string;
  message: string;
}

export type AuthenticationEventType =
  | 'sso'
  | 'password'
  | 'oauth'
  | 'mfa'
  | 'magic_auth'
  | 'email_verification';

export type AuthenticationEvent = {
  type: AuthenticationEventType;
  email?: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string | null;
  error?: AuthenticationEventError;
};

export interface AuthenticationEventResponse {
  type: AuthenticationEventType;
  email?: string;
  ip_address: string | null;
  user_agent: string | null;
  user_id: string | null;
  error?: AuthenticationEventError;
}
