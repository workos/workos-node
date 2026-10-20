import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

/** How an agent instance was minted. */
export type AgentInstanceType = 'delegated' | 'autonomous';

/** A concrete agent minted from an agent blueprint. */
export interface AgentInstance {
  object: 'agent_instance';
  /** Unique identifier of the agent instance. */
  id: string;
  /** Unique identifier of the agent blueprint the instance was minted from. */
  agentBlueprintId: string;
  /** Unique identifier of the Organization the instance belongs to. */
  organizationId: string;
  /**
   * Unique identifier of the Organization Membership the instance acts on
   * behalf of, or `null` for autonomous instances.
   */
  organizationMembershipId: string | null;
  /** How the instance was minted. */
  type: AgentInstanceType;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface SerializedAgentInstance {
  object: 'agent_instance';
  id: string;
  agent_blueprint_id: string;
  organization_id: string;
  organization_membership_id: string | null;
  type: AgentInstanceType;
  created_at: string;
  updated_at: string;
}

/** Options for listing agent instances. */
export interface ListAgentInstancesOptions extends PaginationOptions {
  /** Filter instances to a single Organization. */
  organizationId?: string;
  /** Filter instances to a single agent blueprint. */
  agentBlueprintId?: string;
}

export interface SerializedListAgentInstancesOptions extends PaginationOptions {
  organization_id?: string;
  agent_blueprint_id?: string;
}
