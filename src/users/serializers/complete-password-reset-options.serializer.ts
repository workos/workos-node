import {
  CompletePasswordResetOptions,
  SerializedCompletePasswordResetOptions,
} from '../interfaces';

export const serializeCompletePasswordResetOptions = (
  options: CompletePasswordResetOptions,
): SerializedCompletePasswordResetOptions => ({
  token: options.token,
  new_password: options.newPassword,
});
