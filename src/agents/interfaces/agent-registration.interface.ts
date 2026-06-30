/** The lifecycle status of an agent registration. */
export type AgentRegistrationStatus =
  | 'unverified'
  | 'verified'
  | 'expired'
  | 'revoked';

/** The kind of agent registration, derived from its authentication method. */
export type AgentRegistrationKind =
  | 'anonymous'
  | 'service_auth'
  | 'identity_assertion';

/** The agent identity an agent registration belongs to. */
export interface AgentIdentity {
  /** Unique identifier of the agent identity. */
  id: string;
  /** The Userland user the agent identity is associated with, if any. */
  userlandUserId: string | null;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface SerializedAgentIdentity {
  id: string;
  userland_user_id: string | null;
  created_at: string;
  updated_at: string;
}

/** The completion of an agent registration claim. */
export interface AgentRegistrationClaimCompletion {
  /** Unique identifier of the claim completion. */
  id: string;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
  /** An ISO 8601 timestamp. */
  expiresAt: string;
  /** An ISO 8601 timestamp of when the registration was claimed. */
  claimedAt: string;
}

export interface SerializedAgentRegistrationClaimCompletion {
  id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  claimed_at: string;
}

/** The claim state of an agent registration. */
export interface AgentRegistrationClaim {
  /** Unique identifier of the claim. */
  id: string;
  /** The completion of the claim, or `null` if it has not been claimed. */
  claimCompletion: AgentRegistrationClaimCompletion | null;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
  /** An ISO 8601 timestamp. */
  expiresAt: string;
}

export interface SerializedAgentRegistrationClaim {
  id: string;
  claim_completion: SerializedAgentRegistrationClaimCompletion | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

/** A single agent registration. */
export interface AgentRegistration {
  /** Unique identifier of the agent registration. */
  id: string;
  /** The agent identity the registration belongs to. */
  agentIdentity: AgentIdentity;
  /** Unique identifier of the Organization the registration belongs to. */
  organizationId: string;
  /** The lifecycle status of the registration. */
  status: AgentRegistrationStatus;
  /** The kind of registration. */
  kind: AgentRegistrationKind;
  /** The claim state of the registration, or `null` if it has none. */
  claim: AgentRegistrationClaim | null;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface SerializedAgentRegistration {
  id: string;
  agent_identity: SerializedAgentIdentity;
  organization_id: string;
  status: AgentRegistrationStatus;
  kind: AgentRegistrationKind;
  claim: SerializedAgentRegistrationClaim | null;
  created_at: string;
  updated_at: string;
}
