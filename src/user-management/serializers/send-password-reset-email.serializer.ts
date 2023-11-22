import {
  SendPasswordResetEmailOptions,
  SerializedSendPasswordResetEmailOptions,
} from '../interfaces';

export const serializeSendPasswordResetEmailOptions = (
  options: SendPasswordResetEmailOptions,
): SerializedSendPasswordResetEmailOptions => ({
  email: options.email,
  password_reset_url: options.passwordResetUrl,
});
