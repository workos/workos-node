import { User, UserResponse } from './user.interface';

export interface SendPasswordResetEmailOptions {
  email: string;
  passwordResetUrl: string;
}

export interface SerializedSendPasswordResetEmailOptions {
  email: string;
  password_reset_url: string;
}

export interface SendPasswordResetEmailResponse {
  token: string;
  user: User;
}

export interface SendPasswordResetEmailResponseResponse {
  token: string;
  user: UserResponse;
}
