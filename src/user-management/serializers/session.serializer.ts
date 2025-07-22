import { UserSession, UserSessionResponse } from '../interfaces';

export const deserializeSession = (
  session: UserSessionResponse,
): UserSession => ({
  object: 'session',
  id: session.id,
  userId: session.user_id,
  ipAddress: session.ip_address,
  userAgent: session.user_agent,
  organizationId: session.organization_id,
  impersonator: session.impersonator,
  authMethod: session.auth_method,
  status: session.status,
  expiresAt: session.expires_at,
  endedAt: session.ended_at,
  createdAt: session.created_at,
  updatedAt: session.updated_at,
});
