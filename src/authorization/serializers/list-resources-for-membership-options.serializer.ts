import {
  ListResourcesForMembershipOptions,
  SerializedListResourcesForMembershipOptions,
} from '../interfaces/list-resources-for-membership-options.interface';

/**
 * Serialize SDK options to API query parameters
 * Converts camelCase to snake_case and arrays to comma-separated strings
 */
export const serializeListResourcesForMembershipOptions = (
  options: Omit<ListResourcesForMembershipOptions, 'organizationMembershipId'>,
): SerializedListResourcesForMembershipOptions => ({
  ...(options.resourceTypeSlugs && {
    resource_type_slugs: options.resourceTypeSlugs.join(','),
  }),
  ...(options.limit !== undefined && { limit: options.limit }),
  ...(options.after && { after: options.after }),
  ...(options.before && { before: options.before }),
  ...(options.order && { order: options.order }),
});
