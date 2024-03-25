interface AuthenticationEventError {
  code: string;
  message: string;
}

export type AuthenticationEventType =
  | 'email_verification'
  | 'magic_auth'
  | 'mfa'
  | 'oauth'
  | 'password'
  | 'sso';

export interface AuthenticationEvent<T extends AuthenticationEventType> {
  type: T;
  email: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string | null;
  error?: AuthenticationEventError;
}

export interface AuthenticationEventResponse<
  T extends AuthenticationEventType,
> {
  type: T;
  email: string;
  ip_address: string | null;
  user_agent: string | null;
  user_id: string | null;
  error?: AuthenticationEventError;
}
