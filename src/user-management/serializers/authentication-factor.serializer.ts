import {
  AuthenticationFactor,
  AuthenticationFactorResponse,
  AuthenticationFactorWithSecrets,
  AuthenticationFactorWithSecretsResponse,
} from '../interfaces/authentication-factor.interface';
import { deserializeSms } from '../../multi-factor-auth/serializers/sms.serializer';
import {
  deserializeTotp,
  deserializeTotpWithSecrets,
} from '../../multi-factor-auth/serializers/totp.serializer';

export const deserializeFactor = (
  factor: AuthenticationFactorResponse,
): AuthenticationFactor => ({
  object: factor.object,
  id: factor.id,
  createdAt: factor.created_at,
  updatedAt: factor.updated_at,
  type: factor.type,
  ...(factor.sms ? { sms: deserializeSms(factor.sms) } : {}),
  ...(factor.totp ? { totp: deserializeTotp(factor.totp) } : {}),
  userId: factor.user_id,
});

export const deserializeFactorWithSecrets = (
  factor: AuthenticationFactorWithSecretsResponse,
): AuthenticationFactorWithSecrets => ({
  object: factor.object,
  id: factor.id,
  createdAt: factor.created_at,
  updatedAt: factor.updated_at,
  type: factor.type,
  totp: deserializeTotpWithSecrets(factor.totp),
  userId: factor.user_id,
});
