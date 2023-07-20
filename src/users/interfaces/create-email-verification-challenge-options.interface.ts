import { User } from './user.interface';

export interface CreateEmailVerificationChallengeOptions {
  userId: string;
  verificationUrl: string;
}

export interface CreateEmailVerificationChallengeResponse {
  token: string;
  user: User;
}
