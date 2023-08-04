import { Challenge, ChallengeResponse } from '../interfaces';

export const deserializeChallenge = (
  challenge: ChallengeResponse,
): Challenge => ({
  object: challenge.object,
  id: challenge.id,
  createdAt: challenge.created_at,
  updatedAt: challenge.updated_at,
  expiresAt: challenge.expires_at,
  code: challenge.code,
  authenticationFactorId: challenge.authentication_factor_id,
});
