import { FactorType } from '../../multi-factor-auth/interfaces/factor.interface';
import {
  Sms,
  SmsResponse,
} from '../../multi-factor-auth/interfaces/sms.interface';
import {
  Totp,
  TotpResponse,
  TotpWithSecrets,
  TotpWithSecretsResponse,
} from '../../multi-factor-auth/interfaces/totp.interface';

export type AuthenticationFactorType = FactorType;

export interface AuthenticationFactor {
  object: 'authentication_factor';
  id: string;
  createdAt: string;
  updatedAt: string;
  type: AuthenticationFactorType;
  sms?: Sms;
  totp?: Totp;
  userId: string;
}

export interface AuthenticationFactorWithSecrets {
  object: 'authentication_factor';
  id: string;
  createdAt: string;
  updatedAt: string;
  type: 'totp';
  totp: TotpWithSecrets;
  userId: string;
}

export interface AuthenticationFactorResponse {
  object: 'authentication_factor';
  id: string;
  created_at: string;
  updated_at: string;
  type: AuthenticationFactorType;
  sms?: SmsResponse;
  totp?: TotpResponse;
  user_id: string;
}

export interface AuthenticationFactorWithSecretsResponse {
  object: 'authentication_factor';
  id: string;
  created_at: string;
  updated_at: string;
  type: 'totp';
  totp: TotpWithSecretsResponse;
  user_id: string;
}
