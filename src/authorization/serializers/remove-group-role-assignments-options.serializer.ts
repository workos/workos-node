import {
  RemoveGroupRoleAssignmentsOptions,
  SerializedRemoveGroupRoleAssignmentsOptions,
} from '../interfaces/remove-group-role-assignments-options.interface';

export const serializeRemoveGroupRoleAssignmentsOptions = (
  options: RemoveGroupRoleAssignmentsOptions,
): SerializedRemoveGroupRoleAssignmentsOptions => ({
  role_slug: options.roleSlug,
  ...('resourceId' in options && { resource_id: options.resourceId }),
  ...('resourceExternalId' in options && {
    resource_external_id: options.resourceExternalId,
    resource_type_slug: options.resourceTypeSlug,
  }),
});
