import { Challenge, ChallengeResponse } from '../interfaces';

export const deserializeChallenge = (
  challenge: ChallengeResponse,
): Challenge => ({
  object: challenge.object,
  id: challenge.id,
  createdAt: new Date(challenge.created_at),
  updatedAt: new Date(challenge.updated_at),
  expiresAt:
    challenge.expires_at != null ? new Date(challenge.expires_at) : undefined,
  code: challenge.code,
  authenticationFactorId: challenge.authentication_factor_id,
});
