import {
  AgentInstanceSession,
  ListAgentInstanceSessionsOptions,
  SerializedAgentInstanceSession,
  SerializedListAgentInstanceSessionsOptions,
} from '../interfaces/agent-instance-session.interface';

export function deserializeAgentInstanceSession(
  session: SerializedAgentInstanceSession,
): AgentInstanceSession {
  return {
    object: session.object,
    id: session.id,
    agentInstanceId: session.agent_instance_id,
    status: session.status,
    expiresAt: new Date(session.expires_at),
    revokedAt: session.revoked_at != null ? new Date(session.revoked_at) : null,
    createdAt: new Date(session.created_at),
    updatedAt: new Date(session.updated_at),
  };
}

export function serializeListAgentInstanceSessionsOptions(
  options: ListAgentInstanceSessionsOptions,
): SerializedListAgentInstanceSessionsOptions {
  return {
    agent_blueprint_id: options.agentBlueprintId,
    agent_instance_id: options.agentInstanceId,
    limit: options.limit,
    before: options.before,
    after: options.after,
    order: options.order,
  };
}
