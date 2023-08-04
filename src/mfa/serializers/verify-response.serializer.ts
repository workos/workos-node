import { VerifyResponse, VerifyResponseResponse } from '../interfaces';
import { deserializeChallenge } from './challenge.serializer';

export const deserializeVerifyResponse = (
  verifyResponse: VerifyResponseResponse,
): VerifyResponse => ({
  challenge: deserializeChallenge(verifyResponse.challenge),
  valid: verifyResponse.valid,
});
