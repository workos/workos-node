import {
  RemoveRoleOptions,
  SerializedRemoveRoleOptions,
} from '../interfaces/remove-role-options.interface';

export const serializeRemoveRoleOptions = (
  options: RemoveRoleOptions,
): SerializedRemoveRoleOptions => ({
  role_slug: options.roleSlug,
  ...('resourceId' in options && { resource_id: options.resourceId }),
  ...('resourceExternalId' in options && {
    resource_external_id: options.resourceExternalId,
    resource_type_slug: options.resourceTypeSlug,
  }),
});
