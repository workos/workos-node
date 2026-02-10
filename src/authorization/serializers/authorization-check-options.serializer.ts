import {
  AuthorizationCheckOptions,
  SerializedAuthorizationCheckOptions,
} from '../interfaces';

/**
 * Serializes SDK check options to API request format.
 *
 * Converts camelCase to snake_case and only includes
 * fields that are explicitly provided (truthy check).
 *
 * Note: organizationMembershipId is handled separately in the URL path.
 */
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
