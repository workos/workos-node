import {
  AgentCredentialValidation,
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
  };
}
