import {
  SerializedUserApiKey,
  UserApiKey,
} from '../interfaces/user-api-key.interface';

export function deserializeUserApiKey(
  apiKey: SerializedUserApiKey,
): UserApiKey {
  return {
    object: apiKey.object,
    id: apiKey.id,
    owner: {
      type: 'user',
      id: apiKey.owner.id,
      organizationId: apiKey.owner.organization_id,
    },
    name: apiKey.name,
    obfuscatedValue: apiKey.obfuscated_value,
    lastUsedAt:
      apiKey.last_used_at != null ? new Date(apiKey.last_used_at) : null,
    expiresAt: apiKey.expires_at != null ? new Date(apiKey.expires_at) : null,
    permissions: apiKey.permissions,
    createdAt: new Date(apiKey.created_at),
    updatedAt: new Date(apiKey.updated_at),
  };
}
