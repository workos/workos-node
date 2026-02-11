import {
  ListAuthorizationResourcesOptions,
  SerializedListAuthorizationResourcesOptions,
} from '../interfaces/list-resources-options.interface';

/**
 * Serialize SDK options to API query parameters
 * Converts camelCase to snake_case and arrays to comma-separated strings
 * Only includes fields that are provided (truthy check for optional fields)
 */
export const serializeListAuthorizationResourcesOptions = (
  options: ListAuthorizationResourcesOptions,
): SerializedListAuthorizationResourcesOptions => ({
  ...(options.organizationIds &&
    options.organizationIds.length > 0 && {
      organization_ids: options.organizationIds.join(','),
    }),
  ...(options.resourceTypeSlugs &&
    options.resourceTypeSlugs.length > 0 && {
      resource_type_slugs: options.resourceTypeSlugs.join(','),
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
