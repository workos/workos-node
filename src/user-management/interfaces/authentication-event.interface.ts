interface AuthenticationEventError {
  code: string;
  message: string;
}

export interface AuthenticationEventSso {
  connectionId: string;
  organizationId: string;
  sessionId?: string;
}

export interface AuthenticationEventSsoResponse {
  connection_id: string;
  organization_id: string;
  session_id?: string;
}

type AuthenticationEventType =
  | 'sso'
  | 'password'
  | 'oauth'
  | 'mfa'
  | 'magic_auth'
  | 'email_verification';

type AuthenticationEventStatus = 'failed' | 'succeeded';

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
