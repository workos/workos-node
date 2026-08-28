/** Tokens minted for an agent session. */
export interface AgentToken {
  /** The access token for the agent session. */
  accessToken: string;
  /** The token type, always `Bearer`. */
  tokenType: 'Bearer';
  /** Number of seconds until the access token expires. */
  expiresIn: number;
  /** The refresh token for the agent session. */
  refreshToken: string;
  /** Unique identifier of the agent instance the token belongs to. */
  agentInstanceId: string;
  /** Whether a new agent instance was created by this mint. */
  newInstance: boolean;
  /** Unique identifier of the agent instance session the token belongs to. */
  agentInstanceSessionId: string;
  /** The permission slugs granted to the session. */
  permissions: string[];
}

export interface SerializedAgentToken {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  agent_instance_id: string;
  new_instance: boolean;
  agent_instance_session_id: string;
  permissions: string[];
}

interface MintAgentTokenBaseOptions {
  /** Unique identifier of the agent blueprint to mint from. */
  agentBlueprintId: string;
  /** A free-form description of what the session is intended to do. */
  intent?: string;
}

/** Options for minting a user-delegated agent token. */
export interface MintUserDelegatedAgentTokenOptions extends MintAgentTokenBaseOptions {
  type: 'user_delegated';
  /** The access token of the user delegating to the agent. */
  userAccessToken: string;
}

/** Options for minting an autonomous agent token. */
export interface MintAutonomousAgentTokenOptions extends MintAgentTokenBaseOptions {
  type: 'autonomous';
  /** The organization in which to mint the session. */
  organizationId: string;
}

/** Options for minting an agent-delegated agent token. */
export interface MintAgentDelegatedAgentTokenOptions extends MintAgentTokenBaseOptions {
  type: 'agent_delegated';
  /** The access token of the agent delegating to the new agent. */
  agentAccessToken: string;
}

/** Options for refreshing an agent token. */
export interface RefreshAgentTokenOptions extends MintAgentTokenBaseOptions {
  type: 'refresh';
  /** The refresh token from a previous mint. */
  refreshToken: string;
}

/** Options for minting an agent token from a blueprint. */
export type MintAgentTokenOptions =
  | MintUserDelegatedAgentTokenOptions
  | MintAutonomousAgentTokenOptions
  | MintAgentDelegatedAgentTokenOptions
  | RefreshAgentTokenOptions;

export type SerializedMintAgentTokenOptions =
  | {
      type: 'user_delegated';
      user_access_token: string;
      intent?: string;
    }
  | {
      type: 'autonomous';
      organization_id: string;
      intent?: string;
    }
  | {
      type: 'agent_delegated';
      agent_access_token: string;
      intent?: string;
    }
  | {
      type: 'refresh';
      refresh_token: string;
      intent?: string;
    };
