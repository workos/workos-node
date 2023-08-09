import { SerializedUpdateUserOptions, UpdateUserOptions } from '../interfaces';

export const serializeUpdateUserOptions = (
  options: UpdateUserOptions,
): SerializedUpdateUserOptions => {
  if (!options.firstName || !options.lastName) {
    throw new Error('At least one of the properties must be provided');
  }

  return {
    first_name: options.firstName,
    last_name: options.lastName,
  };
};
