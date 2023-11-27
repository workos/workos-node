import {
  Factor,
  FactorResponse,
  FactorWithSecrets,
  FactorWithSecretsResponse,
} from '../interfaces/factor.interface';
import {
  deserializeTotp,
  deserializeTotpWithSecrets,
} from '../../mfa/serializers/totp.serializer';

export const deserializeFactor = (factor: FactorResponse): Factor => ({
  object: factor.object,
  id: factor.id,
  createdAt: factor.created_at,
  updatedAt: factor.updated_at,
  type: factor.type,
  totp: deserializeTotp(factor.totp),
  userId: factor.user_id,
});

export const deserializeFactorWithSecrets = (
  factor: FactorWithSecretsResponse,
): FactorWithSecrets => ({
  object: factor.object,
  id: factor.id,
  createdAt: factor.created_at,
  updatedAt: factor.updated_at,
  type: factor.type,
  totp: deserializeTotpWithSecrets(factor.totp),
  userId: factor.user_id,
});
