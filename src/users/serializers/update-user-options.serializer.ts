import { SerializedUpdateUserOptions, UpdateUserOptions } from '../interfaces';

export const serializeUpdateUserOptions = (
  options: UpdateUserOptions,
): SerializedUpdateUserOptions => {
  if (Object.keys(options).length === 0) {
    throw new Error('At least one property must be provided');
  }

  return {
    first_name: options.firstName,
    last_name: options.lastName,
  } as SerializedUpdateUserOptions;
};
