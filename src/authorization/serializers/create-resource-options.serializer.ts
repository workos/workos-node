import {
  CreateAuthorizationResourceOptions,
  SerializedCreateAuthorizationResourceOptions,
} from '../../fga/interfaces';

/**
 * Serializes CreateAuthorizationResourceOptions for the API request.
 * Converts camelCase to snake_case for API compatibility.
 */
export const serializeCreateResourceOptions = (
  options: CreateAuthorizationResourceOptions,
): SerializedCreateAuthorizationResourceOptions => ({
  organization_id: options.organizationId,
  resource_type_slug: options.resourceTypeSlug,
  external_id: options.externalId,
  name: options.name,
  description: options.description,
  parent_resource_id: options.parentResourceId,
});
