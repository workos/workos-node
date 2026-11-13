import {
  EmailVerification,
  EmailVerificationEvent,
  EmailVerificationEventResponse,
  EmailVerificationResponse,
} from '../interfaces';

export const deserializeEmailVerification = (
  emailVerification: EmailVerificationResponse,
): EmailVerification => ({
  object: emailVerification.object,
  id: emailVerification.id,
  userId: emailVerification.user_id,
  email: emailVerification.email,
  expiresAt: new Date(emailVerification.expires_at),
  code: emailVerification.code,
  createdAt: new Date(emailVerification.created_at),
  updatedAt: new Date(emailVerification.updated_at),
});

export const deserializeEmailVerificationEvent = (
  emailVerification: EmailVerificationEventResponse,
): EmailVerificationEvent => ({
  object: emailVerification.object,
  id: emailVerification.id,
  userId: emailVerification.user_id,
  email: emailVerification.email,
  expiresAt: new Date(emailVerification.expires_at),
  createdAt: new Date(emailVerification.created_at),
  updatedAt: new Date(emailVerification.updated_at),
});
