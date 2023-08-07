import {
  SerializedUpdateUserPasswordOptions,
  UpdateUserPasswordOptions,
} from '../interfaces';

export const serializeUpdateUserPasswordOptions = (
  options: UpdateUserPasswordOptions,
): SerializedUpdateUserPasswordOptions => ({
  password: options.password,
});
