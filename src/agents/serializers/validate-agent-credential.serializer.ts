import {
  AgentAccessTokenClaims,
  AgentCredentialValidation,
  SerializedAgentAccessTokenClaims,
  SerializedAgentCredentialValidation,
  SerializedValidateAgentCredentialOptions,
  ValidateAgentCredentialOptions,
} from '../interfaces/validate-agent-credential.interface';

export function serializeValidateAgentCredentialOptions(
  options: ValidateAgentCredentialOptions,
): SerializedValidateAgentCredentialOptions {
  return {
    type: options.type,
    credential: options.credential,
  };
}

export function deserializeAgentCredentialValidation(
  validation: SerializedAgentCredentialValidation,
): AgentCredentialValidation {
  return {
    valid: validation.valid,
    registrationId: validation.registration_id,
    expiresAt: validation.expires_at,
    claims: null,
  };
}

export function deserializeAgentAccessTokenClaims(
  payload: SerializedAgentAccessTokenClaims,
): AgentAccessTokenClaims {
  return {
    issuer: payload.iss,
    audience: payload.aud,
    registrationId: payload.sub ?? '',
    jwtId: payload.jti ?? '',
    organizationId: payload.organization_id ?? '',
    scope: payload.scope,
    actor: payload.act,
    expiresAt: payload.exp,
    issuedAt: payload.iat,
  };
}
