interface AuthenticationEventError {
  code: string;
  message: string;
}

export interface AuthenticationEventSso {
  connectionId: string | null;
  organizationId: string | null;
  sessionId: string | null;
}

export interface AuthenticationEventSsoResponse {
  connection_id: string | null;
  organization_id: string | null;
  session_id: string | null;
}

export type AuthenticationEventType =
  | 'sso'
  | 'password'
  | 'oauth'
  | 'mfa'
  | 'magic_auth'
  | 'email_verification'
  | 'passkey'
  | 'reauthentication';

export type AuthenticationEventStatus =
  'failed' | 'succeeded' | 'started' | 'timed_out';

export type AuthenticationEvent = {
  email: string | null;
  error?: AuthenticationEventError;
  ipAddress: string | null;
  sso?: AuthenticationEventSso;
  status: AuthenticationEventStatus;
  type: AuthenticationEventType;
  userAgent: string | null;
  userId: string | null;
};

export interface AuthenticationEventResponse {
  email: string | null;
  error?: AuthenticationEventError;
  ip_address: string | null;
  sso?: AuthenticationEventSsoResponse;
  status: AuthenticationEventStatus;
  type: AuthenticationEventType;
  user_agent: string | null;
  user_id: string | null;
}
