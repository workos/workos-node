export interface Challenge {
  object: 'authentication_challenge';
  id: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  code?: string;
  authenticationFactorId: string;
}

export interface ChallengeResponse {
  object: 'authentication_challenge';
  id: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  code?: string;
  authentication_factor_id: string;
}
