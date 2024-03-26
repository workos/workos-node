interface AuthenticationEventError {
  code: string;
  message: string;
}

interface AuthenticationEventTypes {
  'sso': {},
  'password': {},
  'oauth': {},
  'mfa': {},
  'magic_auth': {},
  'email_verification': {},
}

export type AuthenticationEventType = keyof AuthenticationEventTypes;

export type AuthenticationEvent<T extends AuthenticationEventType> = {
  type: T;
  email: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string | null;
  error?: AuthenticationEventError;
} & Pick<AuthenticationEventTypes, T>

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
