import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

/** The lifecycle status of an agent instance session. */
export type AgentInstanceSessionStatus = 'active' | 'revoked' | 'expired';

/** A session minted for an agent instance. */
export interface AgentInstanceSession {
  object: 'agent_instance_session';
  /** Unique identifier of the agent instance session. */
  id: string;
  /** Unique identifier of the agent instance the session belongs to. */
  agentInstanceId: string;
  /** The lifecycle status of the session. */
  status: AgentInstanceSessionStatus;
  /** An ISO 8601 timestamp of when the session expires. */
  expiresAt: string;
  /** An ISO 8601 timestamp of when the session was revoked, or `null`. */
  revokedAt: string | null;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface SerializedAgentInstanceSession {
  object: 'agent_instance_session';
  id: string;
  agent_instance_id: string;
  status: AgentInstanceSessionStatus;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Options for listing agent instance sessions. */
export interface ListAgentInstanceSessionsOptions extends PaginationOptions {
  /** Filter sessions to a single agent blueprint. */
  agentBlueprintId?: string;
  /** Filter sessions to a single agent instance. */
  agentInstanceId?: string;
}

export interface SerializedListAgentInstanceSessionsOptions extends PaginationOptions {
  agent_blueprint_id?: string;
  agent_instance_id?: string;
}
