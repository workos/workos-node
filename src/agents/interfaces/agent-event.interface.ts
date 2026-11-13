import type {
  AgentBlueprint,
  SerializedAgentBlueprint,
} from './agent-blueprint.interface';
import type { AgentInstanceType } from './agent-instance.interface';
import type {
  AgentRegistrationKind,
  AgentRegistrationStatus,
} from './agent-registration.interface';

// agent.blueprint.created / agent.blueprint.updated (identical shapes)
export interface AgentBlueprintEventData extends AgentBlueprint {
  invocableAs: {
    instanceTypes: AgentInstanceType[];
  };
}

export interface AgentBlueprintEventResponseData extends SerializedAgentBlueprint {
  invocable_as: {
    instance_types: AgentInstanceType[];
  };
}

// agent.blueprint.deleted
export interface AgentBlueprintDeletedEventData {
  object: 'agent_blueprint';
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentBlueprintDeletedEventResponseData {
  object: 'agent_blueprint';
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// agent.instance.session.revoked
export interface AgentInstanceSessionEventData {
  object: 'agent_instance_session';
  id: string;
  agentInstanceId: string;
  organizationId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentInstanceSessionEventResponseData {
  object: 'agent_instance_session';
  id: string;
  agent_instance_id: string;
  organization_id: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

// agent.instance.session.created
export interface AgentInstanceSessionCreatedEventData extends AgentInstanceSessionEventData {
  permissionSlugs: string[];
}

export interface AgentInstanceSessionCreatedEventResponseData extends AgentInstanceSessionEventResponseData {
  permission_slugs: string[];
}

export type AgentRegistrationMethod = 'anonymous' | 'service_auth' | 'id_jag';

// agent.registration.created
export interface AgentRegistrationCreatedEventData {
  object: 'agent_registration';
  id: string;
  agentIdentity: {
    object: 'agent_identity';
    id: string;
    userlandUserId: string | null;
  };
  organizationId: string;
  status: AgentRegistrationStatus;
  kind: AgentRegistrationKind;
  method: AgentRegistrationMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRegistrationCreatedEventResponseData {
  object: 'agent_registration';
  id: string;
  agent_identity: {
    object: 'agent_identity';
    id: string;
    userland_user_id: string | null;
  };
  organization_id: string;
  status: AgentRegistrationStatus;
  kind: AgentRegistrationKind;
  method: AgentRegistrationMethod;
  created_at: string;
  updated_at: string;
}

// agent.registration.claim.attempt.created
export interface AgentRegistrationClaimAttemptCreatedEventData {
  object: 'agent_registration_claim_attempt';
  id: string;
  agentRegistrationId: string;
  agentRegistrationClaimId: string;
  loginHint: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRegistrationClaimAttemptCreatedEventResponseData {
  object: 'agent_registration_claim_attempt';
  id: string;
  agent_registration_id: string;
  agent_registration_claim_id: string;
  login_hint: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// agent.registration.claim.completed
export interface AgentRegistrationClaimCompletedEventData {
  object: 'agent_registration_claim';
  id: string;
  agentRegistrationId: string;
  completedByAttemptId: string;
  claimedBy: {
    userId: string;
    organizationId: string | null;
  };
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRegistrationClaimCompletedEventResponseData {
  object: 'agent_registration_claim';
  id: string;
  agent_registration_id: string;
  completed_by_attempt_id: string;
  claimed_by: {
    user_id: string;
    organization_id: string | null;
  };
  completed_at: string;
  created_at: string;
  updated_at: string;
}

// agent.registration.credential.issued
export type AgentRegistrationCredentialDetail =
  | { kind: 'api_key'; apiKeyId: string }
  | { kind: 'access_token'; jti: string; expiresAt: Date | null };

export type AgentRegistrationCredentialDetailResponse =
  | { kind: 'api_key'; api_key_id: string }
  | { kind: 'access_token'; jti: string; expires_at: string | null };

export interface AgentRegistrationCredentialIssuedEventData {
  object: 'agent_registration_credential';
  id: string;
  agentRegistrationId: string;
  detail: AgentRegistrationCredentialDetail;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRegistrationCredentialIssuedEventResponseData {
  object: 'agent_registration_credential';
  id: string;
  agent_registration_id: string;
  detail: AgentRegistrationCredentialDetailResponse;
  created_at: string;
  updated_at: string;
}

// agent.registration.organization.switched
export interface AgentRegistrationOrganizationSwitchedEventData {
  agentRegistrationId: string;
  fromOrganizationId: string;
  toOrganizationId: string;
}

export interface AgentRegistrationOrganizationSwitchedEventResponseData {
  agent_registration_id: string;
  from_organization_id: string;
  to_organization_id: string;
}

// agent.registration.refreshed / expired / revoked / deleted (identical shapes)
export interface AgentRegistrationLifecycleEventData {
  agentRegistrationId: string;
}

export interface AgentRegistrationLifecycleEventResponseData {
  agent_registration_id: string;
}
