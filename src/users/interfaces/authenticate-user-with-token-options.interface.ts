export interface AuthenticateUserWithTokenOptions {
  clientId: string;
  code: string;
  startSession?: boolean;
  expiresIn?: number;
}
