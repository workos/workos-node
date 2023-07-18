import { User } from './user.interface';

export interface CreatePasswordResetChallengeOptions {
  email: string;
  password_reset_url: string;
}

export interface CreatePasswordResetChallengeResponse {
  token: string;
  user: User;
}
