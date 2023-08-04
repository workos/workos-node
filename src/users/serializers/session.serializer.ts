import { Session, SessionResponse } from '../interfaces/session.interface';

export const deserializeSession = (session: SessionResponse): Session => ({
  id: session.id,
  createdAt: session.created_at,
  expiresAt: session.expires_at,
  token: session.token,
});
