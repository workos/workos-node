import { User, UserResponse } from './user.interface';

export interface CreateEmailVerificationChallengeOptions {
  userId: string;
  verificationUrl: string;
}

export interface SerializedCreateEmailVerificationChallengeOptions {
  verification_url: string;
}

export interface CreateEmailVerificationChallengeResponse {
  token: string;
  user: User;
}

export interface CreateEmailVerificationChallengeResponseResponse {
  token: string;
  user: UserResponse;
}
