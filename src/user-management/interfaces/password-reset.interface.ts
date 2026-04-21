export interface PasswordReset {
  /** Distinguishes the password reset object. */
  object: 'password_reset';
  /** The unique ID of the password reset object. */
  id: string;
  /** The unique ID of the user. */
  userId: string;
  /** The email address of the user. */
  email: string;
  /** The token used to reset the password. */
  passwordResetToken: string;
  /** The URL where the user can reset their password. */
  passwordResetUrl: string;
  /** The timestamp when the password reset token expires. */
  expiresAt: string;
  /** The timestamp when the password reset token was created. */
  createdAt: string;
}

export interface PasswordResetEvent {
  object: 'password_reset';
  id: string;
  userId: string;
  email: string;
  expiresAt: string;
  createdAt: string;
}

export interface PasswordResetResponse {
  object: 'password_reset';
  id: string;
  user_id: string;
  email: string;
  password_reset_token: string;
  password_reset_url: string;
  expires_at: string;
  created_at: string;
}

export interface PasswordResetEventResponse {
  object: 'password_reset';
  id: string;
  user_id: string;
  email: string;
  expires_at: string;
  created_at: string;
}
