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
    // Only access_token credentials carry an audience; forwarding it lets the
    // server verify the JWT `aud` claim against the same value.
    ...(options.type === 'access_token' &&
      options.audience !== undefined && { audience: options.audience }),
  };
}

export function deserializeAgentCredentialValidation(
  validation: SerializedAgentCredentialValidation,
): AgentCredentialValidation {
  if (!validation.valid) {
    return {
      valid: false,
      registrationId: null,
      expiresAt: null,
      claims: null,
    };
  }

  return {
    valid: true,
    registrationId: validation.registration_id ?? '',
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
