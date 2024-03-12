import { Session, SessionResponse } from '../interfaces';

export const deserializeSession = (session: SessionResponse): Session => ({
  object: 'session',
  id: session.id,
  userId: session.user_id,
  ipAddress: session.ip_address,
  userAgent: session.user_agent,
  organizationId: session.organization_id,
  impersonator: session.impersonator,
});
