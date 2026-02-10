/**
 * Options for checking authorization.
 *
 * Resource identification is mutually exclusive:
 * - Use `resourceId` for internal resource ID lookup
 * - Use `resourceExternalId` + `resourceTypeSlug` for external ID lookup
 *
 * The API validates that exactly one identification method is provided.
 */
export interface AuthorizationCheckOptions {
  /** The organization membership ID to check permissions for */
  organizationMembershipId: string;

  /** The permission slug to check (e.g., "documents:edit") */
  permissionSlug: string;

  /** Internal resource ID (mutually exclusive with external ID fields) */
  resourceId?: string;

  /** External resource ID (requires resourceTypeSlug) */
  resourceExternalId?: string;

  /** Resource type slug (required when using resourceExternalId) */
  resourceTypeSlug?: string;
}

/**
 * Serialized options sent to the API (snake_case).
 * Note: organizationMembershipId is not included - it's in the URL path.
 */
export interface SerializedAuthorizationCheckOptions {
  permission_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
