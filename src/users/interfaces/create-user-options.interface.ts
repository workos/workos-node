export interface CreateUserOptions {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

export interface SerializedCreateUserOptions {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
}
