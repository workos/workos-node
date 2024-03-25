interface AuthenticationEventError {
  code: string;
  message: string;
}

type AuthenticationEventType = 'email_verification' | 'magic_auth' | 'mfa' | 'oauth' | 'password' | 'sso'

export interface AuthenticationEvent {
  type: AuthenticationEventType;
  email: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string | null;
  error?: AuthenticationEventError;
} 

export interface AuthenticationEventResponse {
  type: AuthenticationEventType;
  email: string;
  ip_address: string | null;
  user_agent: string | null;
  user_id: string | null;
  error?: AuthenticationEventError;
} 
