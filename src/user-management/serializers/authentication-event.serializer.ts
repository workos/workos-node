import {
  AuthenticationEvent,
  AuthenticationEventResponse,
  AuthenticationEventType,
} from '../interfaces';

export const deserializeAuthenticationEvent = <
  T extends AuthenticationEventType,
>(
  authenticationEvent: AuthenticationEventResponse<T>,
): AuthenticationEvent<T> => ({
  type: authenticationEvent.type,
  email: authenticationEvent.email,
  ipAddress: authenticationEvent.ip_address,
  userAgent: authenticationEvent.user_agent,
  userId: authenticationEvent.user_id,
  error: authenticationEvent.error,
});
