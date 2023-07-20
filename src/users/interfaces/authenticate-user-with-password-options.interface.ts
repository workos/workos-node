export interface AuthenticateUserWithPasswordOptions {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
  startSession?: boolean;
  expiresIn?: number;
}
