export interface UpdateUserOptions {
  userId: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  password?: string;
  passwordHash?: string;
  passwordHashType?: 'bcrypt' | 'firebase-scrypt' | 'ssha';
}

export interface SerializedUpdateUserOptions {
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
  password?: string;
  password_hash?: string;
  password_hash_type?: 'bcrypt' | 'firebase-scrypt' | 'ssha';
}
