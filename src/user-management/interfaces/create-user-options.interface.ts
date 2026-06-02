import { PasswordHashType } from './password-hash-type.interface';

export interface CreateUserOptions {
  email: string;
  password?: string;
  passwordHash?: string;
  passwordHashType?: PasswordHashType;
  name?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  externalId?: string;
  metadata?: Record<string, string>;
  ipAddress?: string;
  userAgent?: string;
}

export interface SerializedCreateUserOptions {
  email: string;
  password?: string;
  password_hash?: string;
  password_hash_type?: PasswordHashType;
  name?: string;
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
  external_id?: string;
  metadata?: Record<string, string>;
  ip_address?: string;
  user_agent?: string;
}
