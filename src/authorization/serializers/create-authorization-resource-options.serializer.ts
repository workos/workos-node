import {
  CreateAuthorizationResourceOptions,
  SerializedCreateAuthorizationResourceOptions,
} from '../interfaces/authorization-resource.interface';

export const serializeCreateResourceOptions = (
  options: CreateAuthorizationResourceOptions,
): SerializedCreateAuthorizationResourceOptions => ({
  organization_id: options.organizationId,
  resource_type_slug: options.resourceTypeSlug,
  external_id: options.externalId,
  name: options.name,
  ...(options.description !== undefined && {
    description: options.description,
  }),
  ...('parentResourceId' in options && {
    parent_resource_id: options.parentResourceId,
  }),
  ...('parentResourceExternalId' in options && {
    parent_resource_external_id: options.parentResourceExternalId,
    parent_resource_type_slug: options.parentResourceTypeSlug,
  }),
});
