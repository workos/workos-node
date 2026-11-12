import {
  CreateOrganizationApiKeyOptions,
  SerializedCreateOrganizationApiKeyOptions,
} from '../interfaces/create-organization-api-key-options.interface';

export function serializeCreateOrganizationApiKeyOptions(
  options: CreateOrganizationApiKeyOptions,
): SerializedCreateOrganizationApiKeyOptions {
  return {
    name: options.name,
    permissions: options.permissions,
    expires_at: options.expiresAt?.toISOString(),
  };
}
