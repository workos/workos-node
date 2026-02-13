import {
  AuthenticationEvent,
  AuthenticationEventResponse,
  AuthenticationEventSso,
  AuthenticationEventSsoResponse,
} from '../interfaces';

const deserializeAuthenticationEventSso = (
  sso: AuthenticationEventSsoResponse,
): AuthenticationEventSso => ({
  connectionId: sso.connection_id,
  organizationId: sso.organization_id,
  ...(sso.session_id !== undefined && { sessionId: sso.session_id }),
});

export const deserializeAuthenticationEvent = (
  authenticationEvent: AuthenticationEventResponse,
): AuthenticationEvent => ({
  email: authenticationEvent.email,
  ...(authenticationEvent.error !== undefined && {
    error: authenticationEvent.error,
  }),
  ipAddress: authenticationEvent.ip_address,
  ...(authenticationEvent.sso !== undefined && {
    sso: deserializeAuthenticationEventSso(authenticationEvent.sso),
  }),
  status: authenticationEvent.status,
  type: authenticationEvent.type,
  userAgent: authenticationEvent.user_agent,
  userId: authenticationEvent.user_id,
});
