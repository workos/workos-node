import {
  RemoveRoleOptions,
  SerializedRemoveRoleOptions,
} from '../interfaces/remove-role-options.interface';

export const serializeRemoveRoleOptions = (
  options: RemoveRoleOptions,
): SerializedRemoveRoleOptions => ({
  role_slug: options.roleSlug,
  ...(options.resourceId && { resource_id: options.resourceId }),
  ...(options.resourceExternalId && {
    resource_external_id: options.resourceExternalId,
  }),
  ...(options.resourceTypeSlug && {
    resource_type_slug: options.resourceTypeSlug,
  }),
});
