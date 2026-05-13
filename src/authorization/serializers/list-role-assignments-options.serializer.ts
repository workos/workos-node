import { serializePaginationOptions } from '../../common/serializers';
import {
  ListRoleAssignmentsOptions,
  SerializedListRoleAssignmentsOptions,
} from '../interfaces/list-role-assignments-options.interface';

export const serializeListRoleAssignmentsOptions = (
  options: Omit<ListRoleAssignmentsOptions, 'organizationMembershipId'>,
): SerializedListRoleAssignmentsOptions => ({
  ...(options.resourceId && { resource_id: options.resourceId }),
  ...(options.resourceExternalId && {
    resource_external_id: options.resourceExternalId,
  }),
  ...(options.resourceTypeSlug && {
    resource_type_slug: options.resourceTypeSlug,
  }),
  ...serializePaginationOptions(options),
});
