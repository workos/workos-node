import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

/** Who may mint sessions from an agent blueprint. */
export interface AgentBlueprintInvocableBy {
  /**
   * Role slugs whose members may mint user-delegated sessions from the
   * blueprint. An empty list allows any member.
   */
  roleSlugs: string[];
  /**
   * Organizations in which sessions may be minted from the blueprint. An empty
   * list allows any organization in the environment.
   */
  organizationIds: string[];
}

export interface SerializedAgentBlueprintInvocableBy {
  role_slugs: string[];
  organization_ids: string[];
}

/** Token and session lifetimes for sessions minted from an agent blueprint. */
export interface AgentBlueprintSessionSettings {
  /**
   * Maximum lifetime of a session in seconds; refreshes never extend a session
   * past this. At most 31,536,000 (365 days).
   */
  maxAgeSeconds: number;
  /** Lifetime of each minted access token in seconds. At most 3,600 (1 hour). */
  accessTokenTtlSeconds: number;
  /** Lifetime of each rotated refresh token in seconds. At most 5,184,000 (60 days). */
  refreshTokenTtlSeconds: number;
}

export interface SerializedAgentBlueprintSessionSettings {
  max_age_seconds: number;
  access_token_ttl_seconds: number;
  refresh_token_ttl_seconds: number;
}

/**
 * An agent blueprint: the template describing what an agent may do (its
 * permission ceiling), who may invoke it, and the lifetimes of its sessions.
 */
export interface AgentBlueprint {
  object: 'agent_blueprint';
  /** Unique identifier of the agent blueprint. */
  id: string;
  /** Human-readable name of the agent blueprint. */
  name: string;
  /** Human-readable description of the agent blueprint. */
  description: string | null;
  /**
   * Permission slugs forming the ceiling on what sessions minted from the
   * blueprint may do.
   */
  permissions: string[];
  /** Who may mint sessions from the blueprint. */
  invocableBy: AgentBlueprintInvocableBy;
  /** Token and session lifetimes for sessions minted from the blueprint. */
  sessionSettings: AgentBlueprintSessionSettings;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface SerializedAgentBlueprint {
  object: 'agent_blueprint';
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  invocable_by: SerializedAgentBlueprintInvocableBy;
  session_settings: SerializedAgentBlueprintSessionSettings;
  created_at: string;
  updated_at: string;
}

/** Options for creating an agent blueprint. */
export interface CreateAgentBlueprintOptions {
  /** Human-readable name of the agent blueprint. */
  name: string;
  /** Human-readable description of the agent blueprint. */
  description?: string;
  /**
   * Permission slugs forming the ceiling on what sessions minted from the
   * blueprint may do. Each slug must exist in the environment.
   */
  permissions?: string[];
  /** Who may mint sessions from the blueprint. */
  invocableBy?: {
    roleSlugs?: string[];
    organizationIds?: string[];
  };
  /** Token and session lifetimes for sessions minted from the blueprint. */
  sessionSettings: {
    maxAgeSeconds: number;
    accessTokenTtlSeconds: number;
    refreshTokenTtlSeconds: number;
  };
}

export interface SerializedCreateAgentBlueprintOptions {
  name: string;
  description?: string;
  permissions?: string[];
  invocable_by?: {
    role_slugs?: string[];
    organization_ids?: string[];
  };
  session_settings: SerializedAgentBlueprintSessionSettings;
}

/**
 * Options for updating an agent blueprint. Omitted fields are left unchanged;
 * provided lists replace the existing configuration.
 */
export interface UpdateAgentBlueprintOptions {
  /** Unique identifier of the agent blueprint. */
  agentBlueprintId: string;
  /** Human-readable name of the agent blueprint. */
  name?: string;
  /** Human-readable description of the agent blueprint, or `null` to clear it. */
  description?: string | null;
  /**
   * Permission slugs forming the ceiling on what sessions minted from the
   * blueprint may do. Each slug must exist in the environment.
   */
  permissions?: string[];
  /** Who may mint sessions from the blueprint. */
  invocableBy?: {
    roleSlugs?: string[];
    organizationIds?: string[];
  };
  /** Token and session lifetimes for sessions minted from the blueprint. */
  sessionSettings?: {
    maxAgeSeconds?: number;
    accessTokenTtlSeconds?: number;
    refreshTokenTtlSeconds?: number;
  };
}

export interface SerializedUpdateAgentBlueprintOptions {
  name?: string;
  description?: string | null;
  permissions?: string[];
  invocable_by?: {
    role_slugs?: string[];
    organization_ids?: string[];
  };
  session_settings?: {
    max_age_seconds?: number;
    access_token_ttl_seconds?: number;
    refresh_token_ttl_seconds?: number;
  };
}

/** Options for listing agent blueprints. */
export type ListAgentBlueprintsOptions = PaginationOptions;
