import {
  AuthorizationCheckOptions,
  SerializedAuthorizationCheckOptions,
} from '../interfaces';

export const serializeAuthorizationCheckOptions = (
  options: AuthorizationCheckOptions,
): SerializedAuthorizationCheckOptions => ({
  permission_slug: options.permissionSlug,
  ...(options.resourceId && { resource_id: options.resourceId }),
  ...(options.resourceExternalId && {
    resource_external_id: options.resourceExternalId,
  }),
  ...(options.resourceTypeSlug && {
    resource_type_slug: options.resourceTypeSlug,
  }),
});
