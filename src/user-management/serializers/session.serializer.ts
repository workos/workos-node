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
  expiresAt: new Date(session.expires_at),
  endedAt: session.ended_at != null ? new Date(session.ended_at) : null,
  createdAt: new Date(session.created_at),
  updatedAt: new Date(session.updated_at),
});
