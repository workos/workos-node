import { Challenge } from './challenge.interface';
export interface VerifyResponseSuccess {
  challenge: Challenge;
  valid: boolean;
}

export interface VerifyResponseError {
  code: string;
  message: string;
}

export type VerifyResponse = VerifyResponseSuccess | VerifyResponseError;
