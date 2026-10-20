import {
  AgentToken,
  MintAgentTokenOptions,
  SerializedAgentToken,
  SerializedMintAgentTokenOptions,
} from '../interfaces/agent-token.interface';

export function deserializeAgentToken(token: SerializedAgentToken): AgentToken {
  return {
    accessToken: token.access_token,
    tokenType: token.token_type,
    expiresIn: token.expires_in,
    refreshToken: token.refresh_token,
    agentInstanceId: token.agent_instance_id,
    newInstance: token.new_instance,
    agentInstanceSessionId: token.agent_instance_session_id,
    permissions: token.permissions,
  };
}

export function serializeMintAgentTokenOptions(
  options: MintAgentTokenOptions,
): SerializedMintAgentTokenOptions {
  const intent = options.intent !== undefined ? { intent: options.intent } : {};

  switch (options.type) {
    case 'user_delegated':
      return {
        type: 'user_delegated',
        user_access_token: options.userAccessToken,
        ...intent,
      };
    case 'autonomous':
      return {
        type: 'autonomous',
        organization_id: options.organizationId,
        ...intent,
      };
    case 'agent_delegated':
      return {
        type: 'agent_delegated',
        agent_access_token: options.agentAccessToken,
        ...intent,
      };
    case 'refresh':
      return {
        type: 'refresh',
        refresh_token: options.refreshToken,
        ...intent,
      };
  }
}
