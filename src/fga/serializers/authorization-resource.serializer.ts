import {
  AuthorizationResource,
  AuthorizationResourceResponse,
  CreateAuthorizationResourceOptions,
  SerializedCreateAuthorizationResourceOptions,
  UpdateAuthorizationResourceOptions,
  SerializedUpdateAuthorizationResourceOptions,
} from '../interfaces/authorization-resource.interface';

/**
 * Deserializes an authorization resource from API response format to SDK format.
 * Converts snake_case fields to camelCase.
 */
export const deserializeAuthorizationResource = (
  resource: AuthorizationResourceResponse,
): AuthorizationResource => ({
  object: resource.object,
  id: resource.id,
  externalId: resource.external_id,
  name: resource.name,
  description: resource.description,
  resourceType: resource.resource_type,
  organizationId: resource.organization_id,
  parentResourceId: resource.parent_resource_id,
  createdAt: resource.created_at,
  updatedAt: resource.updated_at,
});

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

/**
 * Serializes update resource options from SDK format to API request format.
 * Only includes fields that are explicitly provided (including null for clearing).
 */
export const serializeUpdateAuthorizationResourceOptions = (
  options: UpdateAuthorizationResourceOptions,
): SerializedUpdateAuthorizationResourceOptions => {
  const serialized: SerializedUpdateAuthorizationResourceOptions = {};

  if (options.name !== undefined) {
    serialized.name = options.name;
  }

  if (options.description !== undefined) {
    serialized.description = options.description;
  }

  return serialized;
};
