import { Challenge } from './challenge.interface';

export interface VerifyResponse {
  challenge: Challenge;
  valid: boolean;
}
