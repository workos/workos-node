import { User } from './user.interface';

export interface CreatePasswordResetChallengeOptions {
  email: string;
  passwordResetUrl: string;
}

export interface CreatePasswordResetChallengeResponse {
  token: string;
  user: User;
}
