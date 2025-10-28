import { ApiKey, SerializedApiKey } from '../interfaces/api-key.interface';

export function deserializeApiKey(apiKey: SerializedApiKey): ApiKey {
  return {
    object: apiKey.object,
    id: apiKey.id,
    owner: apiKey.owner,
    name: apiKey.name,
    obfuscatedValue: apiKey.obfuscated_value,
    lastUsedAt: apiKey.last_used_at,
    permissions: apiKey.permissions,
    createdAt: apiKey.created_at,
    updatedAt: apiKey.updated_at,
  };
}
