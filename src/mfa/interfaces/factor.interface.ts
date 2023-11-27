import { Sms, SmsResponse } from './sms.interface';
import { Totp, TotpResponse } from './totp.interface';

type FactorType = 'sms' | 'totp' | 'generic_otp';

export interface Factor {
  object: 'authentication_factor';
  id: string;
  createdAt: string;
  updatedAt: string;
  type: FactorType;
  sms?: Sms;
  totp?: Totp;
}

export interface UserManagementFactor {
  object: 'authentication_factor';
  id: string;
  createdAt: string;
  updatedAt: string;
  type: 'totp';
  totp: Totp;
  userId: string;
}

export interface FactorResponse {
  object: 'authentication_factor';
  id: string;
  created_at: string;
  updated_at: string;
  type: FactorType;
  sms?: SmsResponse;
  totp?: TotpResponse;
  user_id?: string;
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
