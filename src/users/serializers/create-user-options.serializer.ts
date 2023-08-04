import { CreateUserOptions, SerializedCreateUserOptions } from '../interfaces';

export const serializeCreateUserOptions = (
  options: CreateUserOptions,
): SerializedCreateUserOptions => ({
  email: options.email,
  password: options.password,
  first_name: options.firstName,
  last_name: options.lastName,
  email_verified: options.emailVerified,
});
