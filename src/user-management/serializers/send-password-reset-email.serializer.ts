import {
  SendPasswordResetEmailOptions,
  SendPasswordResetEmailResponse,
  SendPasswordResetEmailResponseResponse,
  SerializedSendPasswordResetEmailOptions,
} from '../interfaces';
import { deserializeUser } from './user.serializer';

export const deserializeSendPasswordResetEmailResponse = (
  sendPasswordResetEmailResponse: SendPasswordResetEmailResponseResponse,
): SendPasswordResetEmailResponse => ({
  token: sendPasswordResetEmailResponse.token,
  user: deserializeUser(sendPasswordResetEmailResponse.user),
});

export const serializeSendPasswordResetEmailOptions = (
  options: SendPasswordResetEmailOptions,
): SerializedSendPasswordResetEmailOptions => ({
  email: options.email,
  password_reset_url: options.passwordResetUrl,
});
