import { Session, SessionResponse } from '../interfaces';

export const deserializeSession = (session: SessionResponse): Session => ({
  object: 'session',
  id: session.id,
  userId: session.user_id,
  ipAddress: session.ip_address,
  userAgent: session.user_agent,
  ...(session.organization_id !== undefined && {
    organizationId: session.organization_id,
  }),
  ...(session.impersonator !== undefined && {
    impersonator: session.impersonator,
  }),
  authMethod: session.auth_method,
  status: session.status,
  expiresAt: session.expires_at,
  endedAt: session.ended_at,
  createdAt: session.created_at,
  updatedAt: session.updated_at,
});
