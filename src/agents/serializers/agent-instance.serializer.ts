import {
  AgentInstance,
  ListAgentInstancesOptions,
  SerializedAgentInstance,
  SerializedListAgentInstancesOptions,
} from '../interfaces/agent-instance.interface';

export function deserializeAgentInstance(
  instance: SerializedAgentInstance,
): AgentInstance {
  return {
    object: instance.object,
    id: instance.id,
    agentBlueprintId: instance.agent_blueprint_id,
    organizationId: instance.organization_id,
    organizationMembershipId: instance.organization_membership_id,
    type: instance.type,
    createdAt: instance.created_at,
    updatedAt: instance.updated_at,
  };
}

export function serializeListAgentInstancesOptions(
  options: ListAgentInstancesOptions,
): SerializedListAgentInstancesOptions {
  return {
    organization_id: options.organizationId,
    agent_blueprint_id: options.agentBlueprintId,
    limit: options.limit,
    before: options.before,
    after: options.after,
    order: options.order,
  };
}
