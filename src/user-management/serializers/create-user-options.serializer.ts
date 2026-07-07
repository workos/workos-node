import { CreateUserOptions, SerializedCreateUserOptions } from '../interfaces';

export const serializeCreateUserOptions = (
  options: CreateUserOptions,
): SerializedCreateUserOptions => ({
  email: options.email,
  password: options.password,
  password_hash: options.passwordHash,
  password_hash_type: options.passwordHashType,
  name: options.name,
  first_name: options.firstName,
  last_name: options.lastName,
  email_verified: options.emailVerified,
  external_id: options.externalId,
  metadata: options.metadata,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
  signals_id: options.signalsId,
});
