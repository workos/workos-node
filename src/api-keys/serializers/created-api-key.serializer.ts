import {
  CreatedApiKey,
  SerializedCreatedApiKey,
} from '../interfaces/created-api-key.interface';

export function deserializeCreatedApiKey(
  apiKey: SerializedCreatedApiKey,
): CreatedApiKey {
  return {
    object: apiKey.object,
    id: apiKey.id,
    owner: apiKey.owner,
    name: apiKey.name,
    obfuscatedValue: apiKey.obfuscated_value,
    value: apiKey.value,
    lastUsedAt:
      apiKey.last_used_at != null ? new Date(apiKey.last_used_at) : null,
    expiresAt: apiKey.expires_at != null ? new Date(apiKey.expires_at) : null,
    permissions: apiKey.permissions,
    createdAt: new Date(apiKey.created_at),
    updatedAt: new Date(apiKey.updated_at),
  };
}
