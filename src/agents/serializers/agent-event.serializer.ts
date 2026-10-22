import {
  AgentBlueprintDeletedEventData,
  AgentBlueprintDeletedEventResponseData,
  AgentBlueprintEventData,
  AgentBlueprintEventResponseData,
  AgentInstanceSessionCreatedEventData,
  AgentInstanceSessionCreatedEventResponseData,
  AgentInstanceSessionEventData,
  AgentInstanceSessionEventResponseData,
  AgentRegistrationClaimAttemptCreatedEventData,
  AgentRegistrationClaimAttemptCreatedEventResponseData,
  AgentRegistrationClaimCompletedEventData,
  AgentRegistrationClaimCompletedEventResponseData,
  AgentRegistrationCreatedEventData,
  AgentRegistrationCreatedEventResponseData,
  AgentRegistrationCredentialDetail,
  AgentRegistrationCredentialDetailResponse,
  AgentRegistrationCredentialIssuedEventData,
  AgentRegistrationCredentialIssuedEventResponseData,
  AgentRegistrationLifecycleEventData,
  AgentRegistrationLifecycleEventResponseData,
  AgentRegistrationOrganizationSwitchedEventData,
  AgentRegistrationOrganizationSwitchedEventResponseData,
} from '../interfaces/agent-event.interface';
import { deserializeAgentBlueprint } from './agent-blueprint.serializer';

export const deserializeAgentBlueprintEvent = (
  data: AgentBlueprintEventResponseData,
): AgentBlueprintEventData => ({
  ...deserializeAgentBlueprint(data),
  invocableAs: {
    instanceTypes: data.invocable_as.instance_types,
  },
});

export const deserializeAgentBlueprintDeletedEvent = (
  data: AgentBlueprintDeletedEventResponseData,
): AgentBlueprintDeletedEventData => ({
  object: data.object,
  id: data.id,
  name: data.name,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export const deserializeAgentInstanceSessionEvent = (
  data: AgentInstanceSessionEventResponseData,
): AgentInstanceSessionEventData => ({
  object: data.object,
  id: data.id,
  agentInstanceId: data.agent_instance_id,
  organizationId: data.organization_id,
  expiresAt: new Date(data.expires_at),
  revokedAt: data.revoked_at != null ? new Date(data.revoked_at) : null,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export const deserializeAgentInstanceSessionCreatedEvent = (
  data: AgentInstanceSessionCreatedEventResponseData,
): AgentInstanceSessionCreatedEventData => ({
  ...deserializeAgentInstanceSessionEvent(data),
  permissionSlugs: data.permission_slugs,
});

export const deserializeAgentRegistrationCreatedEvent = (
  data: AgentRegistrationCreatedEventResponseData,
): AgentRegistrationCreatedEventData => ({
  object: data.object,
  id: data.id,
  agentIdentity: {
    object: data.agent_identity.object,
    id: data.agent_identity.id,
    userlandUserId: data.agent_identity.userland_user_id,
  },
  organizationId: data.organization_id,
  status: data.status,
  kind: data.kind,
  method: data.method,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export const deserializeAgentRegistrationClaimAttemptCreatedEvent = (
  data: AgentRegistrationClaimAttemptCreatedEventResponseData,
): AgentRegistrationClaimAttemptCreatedEventData => ({
  object: data.object,
  id: data.id,
  agentRegistrationId: data.agent_registration_id,
  agentRegistrationClaimId: data.agent_registration_claim_id,
  loginHint: data.login_hint,
  expiresAt: new Date(data.expires_at),
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export const deserializeAgentRegistrationClaimCompletedEvent = (
  data: AgentRegistrationClaimCompletedEventResponseData,
): AgentRegistrationClaimCompletedEventData => ({
  object: data.object,
  id: data.id,
  agentRegistrationId: data.agent_registration_id,
  completedByAttemptId: data.completed_by_attempt_id,
  claimedBy: {
    userId: data.claimed_by.user_id,
    organizationId: data.claimed_by.organization_id,
  },
  completedAt: new Date(data.completed_at),
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const deserializeAgentRegistrationCredentialDetail = (
  detail: AgentRegistrationCredentialDetailResponse,
): AgentRegistrationCredentialDetail => {
  switch (detail.kind) {
    case 'api_key':
      return { kind: detail.kind, apiKeyId: detail.api_key_id };
    case 'access_token':
      return {
        kind: detail.kind,
        jti: detail.jti,
        expiresAt:
          detail.expires_at != null ? new Date(detail.expires_at) : null,
      };
  }
};

export const deserializeAgentRegistrationCredentialIssuedEvent = (
  data: AgentRegistrationCredentialIssuedEventResponseData,
): AgentRegistrationCredentialIssuedEventData => ({
  object: data.object,
  id: data.id,
  agentRegistrationId: data.agent_registration_id,
  detail: deserializeAgentRegistrationCredentialDetail(data.detail),
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export const deserializeAgentRegistrationOrganizationSwitchedEvent = (
  data: AgentRegistrationOrganizationSwitchedEventResponseData,
): AgentRegistrationOrganizationSwitchedEventData => ({
  agentRegistrationId: data.agent_registration_id,
  fromOrganizationId: data.from_organization_id,
  toOrganizationId: data.to_organization_id,
});

export const deserializeAgentRegistrationLifecycleEvent = (
  data: AgentRegistrationLifecycleEventResponseData,
): AgentRegistrationLifecycleEventData => ({
  agentRegistrationId: data.agent_registration_id,
});
