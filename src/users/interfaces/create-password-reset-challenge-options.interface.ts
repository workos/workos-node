import { User, UserResponse } from './user.interface';

export interface CreatePasswordResetChallengeOptions {
  email: string;
  passwordResetUrl: string;
}

export interface SerializedCreatePasswordResetChallengeOptions {
  email: string;
  password_reset_url: string;
}

export interface CreatePasswordResetChallengeResponse {
  token: string;
  user: User;
}

export interface CreatePasswordResetChallengeResponseResponse {
  token: string;
  user: UserResponse;
}
