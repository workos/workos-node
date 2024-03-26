import {
  AuthenticationEvent,
  AuthenticationEventResponse,
} from '../interfaces';

export const deserializeAuthenticationEvent = (
  authenticationEvent: AuthenticationEventResponse,
): AuthenticationEvent => ({
  type: authenticationEvent.type,
  email: authenticationEvent.email,
  ipAddress: authenticationEvent.ip_address,
  userAgent: authenticationEvent.user_agent,
  userId: authenticationEvent.user_id,
  error: authenticationEvent.error,
});
