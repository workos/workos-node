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
    lastUsedAt: apiKey.last_used_at,
    expiresAt: apiKey.expires_at,
    permissions: apiKey.permissions,
    createdAt: apiKey.created_at,
    updatedAt: apiKey.updated_at,
  };
}
