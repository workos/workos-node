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
    lastUsedAt: apiKey.last_used_at,
    permissions: apiKey.permissions,
    createdAt: apiKey.created_at,
    updatedAt: apiKey.updated_at,
  };
}
