export interface UpdateUserOptions {
  userId: string;
  firstName?: string;
  lastName?: string;
  emailVerifiedAt?: string;
}

export interface SerializedUpdateUserOptions {
  first_name?: string;
  last_name?: string;
  email_verified_at?: string;
}
