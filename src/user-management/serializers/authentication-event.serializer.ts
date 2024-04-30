import {
  AuthenticationEvent,
  AuthenticationEventResponse,
} from '../interfaces';

export const deserializeAuthenticationEvent = (
  authenticationEvent: AuthenticationEventResponse,
): AuthenticationEvent => ({
  email: authenticationEvent.email,
  error: authenticationEvent.error,
  ipAddress: authenticationEvent.ip_address,
  status: authenticationEvent.status,
  type: authenticationEvent.type,
  userAgent: authenticationEvent.user_agent,
  userId: authenticationEvent.user_id,
});
