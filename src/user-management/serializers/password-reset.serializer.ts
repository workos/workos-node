import {
  PasswordReset,
  PasswordResetEvent,
  PasswordResetEventResponse,
  PasswordResetResponse,
} from '../interfaces';

export const deserializePasswordReset = (
  passwordReset: PasswordResetResponse,
): PasswordReset => ({
  object: passwordReset.object,
  id: passwordReset.id,
  userId: passwordReset.user_id,
  email: passwordReset.email,
  passwordResetToken: passwordReset.password_reset_token,
  passwordResetUrl: passwordReset.password_reset_url,
  expiresAt: new Date(passwordReset.expires_at),
  createdAt: new Date(passwordReset.created_at),
});

export const deserializePasswordResetEvent = (
  passwordReset: PasswordResetEventResponse,
): PasswordResetEvent => ({
  object: passwordReset.object,
  id: passwordReset.id,
  userId: passwordReset.user_id,
  email: passwordReset.email,
  expiresAt: new Date(passwordReset.expires_at),
  createdAt: new Date(passwordReset.created_at),
});
