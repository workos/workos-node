import {
  AgentBlueprint,
  CreateAgentBlueprintOptions,
  SerializedAgentBlueprint,
  SerializedCreateAgentBlueprintOptions,
  SerializedUpdateAgentBlueprintOptions,
  UpdateAgentBlueprintOptions,
} from '../interfaces/agent-blueprint.interface';

export function deserializeAgentBlueprint(
  blueprint: SerializedAgentBlueprint,
): AgentBlueprint {
  return {
    object: blueprint.object,
    id: blueprint.id,
    name: blueprint.name,
    description: blueprint.description,
    permissions: blueprint.permissions,
    invocableBy: {
      roleSlugs: blueprint.invocable_by.role_slugs,
      organizationIds: blueprint.invocable_by.organization_ids,
    },
    sessionSettings: {
      maxAgeSeconds: blueprint.session_settings.max_age_seconds,
      accessTokenTtlSeconds:
        blueprint.session_settings.access_token_ttl_seconds,
      refreshTokenTtlSeconds:
        blueprint.session_settings.refresh_token_ttl_seconds,
    },
    createdAt: blueprint.created_at,
    updatedAt: blueprint.updated_at,
  };
}

export function serializeCreateAgentBlueprintOptions(
  options: CreateAgentBlueprintOptions,
): SerializedCreateAgentBlueprintOptions {
  return {
    name: options.name,
    ...(options.description !== undefined && {
      description: options.description,
    }),
    ...(options.permissions !== undefined && {
      permissions: options.permissions,
    }),
    ...(options.invocableBy !== undefined && {
      invocable_by: {
        ...(options.invocableBy.roleSlugs !== undefined && {
          role_slugs: options.invocableBy.roleSlugs,
        }),
        ...(options.invocableBy.organizationIds !== undefined && {
          organization_ids: options.invocableBy.organizationIds,
        }),
      },
    }),
    session_settings: {
      max_age_seconds: options.sessionSettings.maxAgeSeconds,
      access_token_ttl_seconds: options.sessionSettings.accessTokenTtlSeconds,
      refresh_token_ttl_seconds: options.sessionSettings.refreshTokenTtlSeconds,
    },
  };
}

export function serializeUpdateAgentBlueprintOptions(
  options: Omit<UpdateAgentBlueprintOptions, 'agentBlueprintId'>,
): SerializedUpdateAgentBlueprintOptions {
  return {
    ...(options.name !== undefined && { name: options.name }),
    ...(options.description !== undefined && {
      description: options.description,
    }),
    ...(options.permissions !== undefined && {
      permissions: options.permissions,
    }),
    ...(options.invocableBy !== undefined && {
      invocable_by: {
        ...(options.invocableBy.roleSlugs !== undefined && {
          role_slugs: options.invocableBy.roleSlugs,
        }),
        ...(options.invocableBy.organizationIds !== undefined && {
          organization_ids: options.invocableBy.organizationIds,
        }),
      },
    }),
    ...(options.sessionSettings !== undefined && {
      session_settings: {
        ...(options.sessionSettings.maxAgeSeconds !== undefined && {
          max_age_seconds: options.sessionSettings.maxAgeSeconds,
        }),
        ...(options.sessionSettings.accessTokenTtlSeconds !== undefined && {
          access_token_ttl_seconds:
            options.sessionSettings.accessTokenTtlSeconds,
        }),
        ...(options.sessionSettings.refreshTokenTtlSeconds !== undefined && {
          refresh_token_ttl_seconds:
            options.sessionSettings.refreshTokenTtlSeconds,
        }),
      },
    }),
  };
}
