export interface CreateUserOptions {
  email: string;
  password?: string;
  passwordHash?: string;
  passwordHashType?: 'bcrypt' | 'firebase-scrypt' | 'ssha';
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

export interface SerializedCreateUserOptions {
  email: string;
  password?: string;
  password_hash?: string;
  password_hash_type?: 'bcrypt' | 'firebase-scrypt' | 'ssha';
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
}
