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
      createdAt: registration.agent_identity.created_at,
      updatedAt: registration.agent_identity.updated_at,
    },
    organizationId: registration.organization_id,
    status: registration.status,
    kind: registration.kind,
    claim: registration.claim
      ? {
          id: registration.claim.id,
          claimCompletion: registration.claim.claim_completion
            ? {
                id: registration.claim.claim_completion.id,
                createdAt: registration.claim.claim_completion.created_at,
                updatedAt: registration.claim.claim_completion.updated_at,
                expiresAt: registration.claim.claim_completion.expires_at,
                claimedAt: registration.claim.claim_completion.claimed_at,
              }
            : null,
          createdAt: registration.claim.created_at,
          updatedAt: registration.claim.updated_at,
          expiresAt: registration.claim.expires_at,
        }
      : null,
    createdAt: registration.created_at,
    updatedAt: registration.updated_at,
  };
}
