import { Totp, TotpResponse } from './totp.interface';

export interface UserManagementFactor {
  object: 'authentication_factor';
  id: string;
  createdAt: string;
  updatedAt: string;
  type: 'totp';
  totp: Totp;
  userId: string;
}

export interface UserManagementFactorResponse {
  object: 'authentication_factor';
  id: string;
  created_at: string;
  updated_at: string;
  type: 'totp';
  totp: TotpResponse;
  user_id: string;
}
