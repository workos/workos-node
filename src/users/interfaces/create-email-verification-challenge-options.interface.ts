import { User } from './user.interface';

export interface CreateEmailVerificationChallengeOptions {
  id: string;
  verification_url: string;
}

export interface CreateEmailVerificationChallengeResponse {
  token: string;
  user: User;
}
