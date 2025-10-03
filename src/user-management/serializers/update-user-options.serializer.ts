import { SerializedUpdateUserOptions, UpdateUserOptions } from '../interfaces';

export const serializeUpdateUserOptions = (
  options: UpdateUserOptions,
): SerializedUpdateUserOptions => ({
  email: options.email,
  email_verified: options.emailVerified,
  first_name: options.firstName,
  last_name: options.lastName,
  password: options.password,
  password_hash: options.passwordHash,
  password_hash_type: options.passwordHashType,
  external_id: options.externalId,
  locale: options.locale,
  metadata: options.metadata,
});
