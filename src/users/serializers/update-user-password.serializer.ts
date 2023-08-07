import {
  SerializedUpdateUserPasswordOptions,
  UpdateUserPasswordOptions,
} from '../interfaces';

export const serializeUpdateUserPassword = (
  options: UpdateUserPasswordOptions,
): SerializedUpdateUserPasswordOptions => ({
  password: options.password,
});
