import {
  ResetPasswordOptions,
  SerializedResetPasswordOptions,
} from '../interfaces';

export const serializeResetPasswordOptions = (
  options: ResetPasswordOptions,
): SerializedResetPasswordOptions => ({
  token: options.token,
  new_password: options.newPassword,
});
