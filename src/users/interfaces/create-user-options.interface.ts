export interface CreateUserOptions {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}
