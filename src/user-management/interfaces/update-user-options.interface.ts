import { PasswordHashType } from './password-hash-type.interface';

export interface UpdateUserOptions {
  userId: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  password?: string;
  passwordHash?: string;
  passwordHashType?: PasswordHashType;
  externalId?: string;
  metadata?: Record<string, string>;
}

export interface SerializedUpdateUserOptions {
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
  password?: string;
  password_hash?: string;
  password_hash_type?: PasswordHashType;
  external_id?: string;
  metadata?: Record<string, string>;
}
