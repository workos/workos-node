import {
  PasswordlessSession,
  PasswordlessSessionResponse,
} from '../interfaces';

export const deserializePasswordlessSession = (
  passwordlessSession: PasswordlessSessionResponse,
): PasswordlessSession => ({
  id: passwordlessSession.id,
  email: passwordlessSession.email,
  expiresAt: passwordlessSession.expires_at,
  link: passwordlessSession.link,
  object: passwordlessSession.object,
});
