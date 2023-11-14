export interface UpdateUserOptions {
  userId: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

export interface SerializedUpdateUserOptions {
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
}
