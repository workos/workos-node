import { SerializedUpdateUserOptions, UpdateUserOptions } from '../interfaces';

export const serializeUpdateUserOptions = (
  options: UpdateUserOptions,
): SerializedUpdateUserOptions =>
  ({
    first_name: options.firstName,
    last_name: options.lastName,
  } as SerializedUpdateUserOptions);
