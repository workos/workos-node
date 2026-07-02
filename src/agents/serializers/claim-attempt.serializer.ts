import {
  ClaimAttemptResponse,
  LinkClaimAttemptToExternalUserOptions,
  SerializedClaimAttemptResponse,
  SerializedLinkClaimAttemptToExternalUserOptions,
} from '../interfaces/claim-attempt.interface';

export function serializeLinkClaimAttemptToExternalUserOptions(
  options: LinkClaimAttemptToExternalUserOptions,
): SerializedLinkClaimAttemptToExternalUserOptions {
  return {
    type: 'link_external_user',
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
