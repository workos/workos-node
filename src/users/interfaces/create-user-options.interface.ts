export interface CreateUserOptions {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
}
