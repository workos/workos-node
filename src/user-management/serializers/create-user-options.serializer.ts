import { CreateUserOptions, SerializedCreateUserOptions } from '../interfaces';

export const serializeCreateUserOptions = (
  options: CreateUserOptions,
): SerializedCreateUserOptions => ({
  email: options.email,
  password: options.password,
  password_hash: options.passwordHash,
  password_hash_type: options.passwordHashType,
  first_name: options.firstName,
  last_name: options.lastName,
  email_verified: options.emailVerified,
  external_id: options.externalId,
  locale: options.locale,
  metadata: options.metadata,
});
