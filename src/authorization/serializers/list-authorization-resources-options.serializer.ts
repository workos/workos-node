import {
  ListAuthorizationResourcesOptions,
  SerializedListAuthorizationResourcesOptions,
} from '../interfaces/list-authorization-resources-options.interface';

export const serializeListAuthorizationResourcesOptions = (
  options: ListAuthorizationResourcesOptions,
): SerializedListAuthorizationResourcesOptions => ({
  ...(options.organizationId && {
    organization_ids: options.organizationId.join(','),
  }),
  ...(options.resourceTypeSlug && {
    resource_type_slugs: options.resourceTypeSlug.join(','),
  }),
  ...(options.parentResourceId && {
    parent_resource_id: options.parentResourceId,
  }),
  ...(options.parentResourceTypeSlug && {
    parent_resource_type_slug: options.parentResourceTypeSlug,
  }),
  ...(options.parentExternalId && {
    parent_external_id: options.parentExternalId,
  }),
  ...(options.search && { search: options.search }),
  ...(options.limit !== undefined && { limit: options.limit }),
  ...(options.after && { after: options.after }),
  ...(options.before && { before: options.before }),
  ...(options.order && { order: options.order }),
});
