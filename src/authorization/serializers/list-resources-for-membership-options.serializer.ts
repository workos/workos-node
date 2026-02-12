import {
  ListResourcesForMembershipOptions,
  SerializedListResourcesForMembershipOptions,
} from '../interfaces/list-resources-for-membership-options.interface';

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
