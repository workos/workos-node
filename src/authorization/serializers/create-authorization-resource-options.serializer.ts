import {
  CreateAuthorizationResourceOptions,
  SerializedCreateAuthorizationResourceOptions,
} from '../interfaces/create-authorization-resource-options.interface';

/**
 * Serializes create resource options from SDK format to API request format.
 * Converts camelCase fields to snake_case.
 */
export const serializeCreateAuthorizationResourceOptions = (
  options: CreateAuthorizationResourceOptions,
): SerializedCreateAuthorizationResourceOptions => ({
  organization_id: options.organizationId,
  resource_type_slug: options.resourceTypeSlug,
  external_id: options.externalId,
  name: options.name,
  description: options.description,
  parent_resource_id: options.parentResourceId,
});
