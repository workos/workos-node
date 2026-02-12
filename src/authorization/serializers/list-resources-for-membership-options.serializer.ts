import {
  ListResourcesForMembershipOptions,
  SerializedListResourcesForMembershipOptions,
} from '../interfaces/list-resources-for-membership-options.interface';

export const serializeListResourcesForMembershipOptions = (
  options: ListResourcesForMembershipOptions,
): SerializedListResourcesForMembershipOptions => ({
  permission_slug: options.permissionSlug,
  ...(options.limit !== undefined && { limit: options.limit }),
  ...(options.after && { after: options.after }),
  ...(options.before && { before: options.before }),
  ...(options.order && { order: options.order }),
  ...('parentResourceId' in options && {
    parent_resource_id: options.parentResourceId,
  }),
  ...('parentResourceExternalId' in options && {
    parent_resource_type_slug: options.parentResourceTypeSlug,
    parent_resource_external_id: options.parentResourceExternalId,
  }),
});
