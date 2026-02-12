import {
  AssignRoleOptions,
  SerializedAssignRoleOptions,
} from '../interfaces/assign-role-options.interface';

export const serializeAssignRoleOptions = (
  options: AssignRoleOptions,
): SerializedAssignRoleOptions => ({
  role_slug: options.roleSlug,
  ...('resourceId' in options && { resource_id: options.resourceId }),
  ...('resourceExternalId' in options && {
    resource_external_id: options.resourceExternalId,
    resource_type_slug: options.resourceTypeSlug,
  }),
});
