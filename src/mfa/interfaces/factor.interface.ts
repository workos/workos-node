import { Sms, SmsResponse } from './sms.interface';
import { Totp, TotpResponse } from './totp.interface';

export interface Factor {
  object: 'authentication_factor';
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  sms?: Sms;
  totp?: Totp;
}

export interface FactorResponse {
  object: 'authentication_factor';
  id: string;
  created_at: string;
  updated_at: string;
  type: string;
  sms?: SmsResponse;
  totp?: TotpResponse;
}
