import { serializePaginationOptions } from '../../common/serializers';
import {
  ListResourcesForMembershipOptions,
  SerializedListResourcesForMembershipOptions,
} from '../interfaces/list-resources-for-membership-options.interface';

export const serializeListResourcesForMembershipOptions = (
  options: ListResourcesForMembershipOptions,
): SerializedListResourcesForMembershipOptions => ({
  permission_slug: options.permissionSlug,
  ...serializePaginationOptions(options),
  ...('parentResourceId' in options && {
    parent_resource_id: options.parentResourceId,
  }),
  ...('parentResourceExternalId' in options && {
    parent_resource_type_slug: options.parentResourceTypeSlug,
    parent_resource_external_id: options.parentResourceExternalId,
  }),
});
