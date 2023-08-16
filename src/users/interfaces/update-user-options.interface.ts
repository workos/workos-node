export interface UpdateUserOptions {
  userId: string;
  firstName?: string;
  lastName?: string;
}

export interface SerializedUpdateUserOptions {
  first_name?: string;
  last_name?: string;
}
