import {
  ClaimAttemptResponse,
  CreateClaimAttemptOptions,
  SerializedClaimAttemptResponse,
  SerializedCreateClaimAttemptOptions,
} from '../interfaces/claim-attempt.interface';

export function serializeCreateClaimAttemptOptions(
  options: CreateClaimAttemptOptions,
): SerializedCreateClaimAttemptOptions {
  return {
    claim_attempt_token: options.claimAttemptToken,
    user: {
      email: options.user.email,
      external_id: options.user.externalId,
    },
    ...(options.organizationId !== undefined && {
      organization_id: options.organizationId,
    }),
  };
}

export function deserializeClaimAttemptResponse(
  response: SerializedClaimAttemptResponse,
): ClaimAttemptResponse {
  return {
    id: response.id,
    status: response.status,
    userCode: response.user_code,
    organizations: response.organizations,
  };
}
