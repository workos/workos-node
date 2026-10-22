import {
  AgentRegistration,
  SerializedAgentRegistration,
} from '../interfaces/agent-registration.interface';

export function deserializeAgentRegistration(
  registration: SerializedAgentRegistration,
): AgentRegistration {
  return {
    id: registration.id,
    agentIdentity: {
      id: registration.agent_identity.id,
      userlandUserId: registration.agent_identity.userland_user_id,
      createdAt: new Date(registration.agent_identity.created_at),
      updatedAt: new Date(registration.agent_identity.updated_at),
    },
    organizationId: registration.organization_id,
    status: registration.status,
    kind: registration.kind,
    revokedAt:
      registration.revoked_at != null
        ? new Date(registration.revoked_at)
        : null,
    claim: registration.claim
      ? {
          id: registration.claim.id,
          claimCompletion: registration.claim.claim_completion
            ? {
                id: registration.claim.claim_completion.id,
                createdAt: new Date(
                  registration.claim.claim_completion.created_at,
                ),
                updatedAt: new Date(
                  registration.claim.claim_completion.updated_at,
                ),
                expiresAt: new Date(
                  registration.claim.claim_completion.expires_at,
                ),
                claimedAt: new Date(
                  registration.claim.claim_completion.claimed_at,
                ),
              }
            : null,
          createdAt: new Date(registration.claim.created_at),
          updatedAt: new Date(registration.claim.updated_at),
          expiresAt: new Date(registration.claim.expires_at),
        }
      : null,
    createdAt: new Date(registration.created_at),
    updatedAt: new Date(registration.updated_at),
  };
}
