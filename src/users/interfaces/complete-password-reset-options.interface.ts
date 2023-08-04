export interface CompletePasswordResetOptions {
  token: string;
  newPassword: string;
}

export interface SerializedCompletePasswordResetOptions {
  token: string;
  new_password: string;
}
