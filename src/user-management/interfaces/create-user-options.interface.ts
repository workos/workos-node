import { PasswordHashType } from './password-hash-type.interface';

export interface CreateUserOptions {
  email: string;
  password?: string;
  passwordHash?: string;
  passwordHashType?: PasswordHashType;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

export interface SerializedCreateUserOptions {
  email: string;
  password?: string;
  password_hash?: string;
  password_hash_type?: PasswordHashType;
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
}
