import {
  AuthorizationCheckOptions,
  SerializedAuthorizationCheckOptions,
} from '../interfaces';

export const serializeAuthorizationCheckOptions = (
  options: AuthorizationCheckOptions,
): SerializedAuthorizationCheckOptions => ({
  permission_slug: options.permissionSlug,
  ...('resourceId' in options && { resource_id: options.resourceId }),
  ...('resourceExternalId' in options && {
    resource_external_id: options.resourceExternalId,
    resource_type_slug: options.resourceTypeSlug,
  }),
});
