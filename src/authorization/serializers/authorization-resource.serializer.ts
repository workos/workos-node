import {
  AuthorizationResource,
  AuthorizationResourceResponse,
} from '../interfaces/authorization-resource.interface';

export const deserializeAuthorizationResource = (
  resource: AuthorizationResourceResponse,
): AuthorizationResource => ({
  object: resource.object,
  id: resource.id,
  externalId: resource.external_id,
  name: resource.name,
  description: resource.description,
  resourceTypeSlug: resource.resource_type_slug,
  organizationId: resource.organization_id,
  parentResourceId: resource.parent_resource_id,
  createdAt: new Date(resource.created_at),
  updatedAt: new Date(resource.updated_at),
});
