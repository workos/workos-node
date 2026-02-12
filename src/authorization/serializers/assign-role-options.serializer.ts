import {
  AssignRoleOptions,
  SerializedAssignRoleOptions,
} from '../interfaces/assign-role-options.interface';

export const serializeAssignRoleOptions = (
  options: AssignRoleOptions,
): SerializedAssignRoleOptions => ({
  role_slug: options.roleSlug,
  ...(options.resourceId && { resource_id: options.resourceId }),
  ...(options.resourceExternalId && {
    resource_external_id: options.resourceExternalId,
  }),
  ...(options.resourceTypeSlug && {
    resource_type_slug: options.resourceTypeSlug,
  }),
});
