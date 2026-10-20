import {
  CreateUserApiKeyOptions,
  SerializedCreateUserApiKeyOptions,
} from '../interfaces/create-user-api-key-options.interface';

export function serializeCreateUserApiKeyOptions(
  options: CreateUserApiKeyOptions,
): SerializedCreateUserApiKeyOptions {
  return {
    name: options.name,
    organization_id: options.organizationId,
    permissions: options.permissions,
    expires_at: options.expiresAt?.toISOString(),
  };
}
