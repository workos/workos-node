/**
 * Options for deleting an authorization resource by internal ID
 * Matches API: DELETE /authorization/resources/:resource_id
 *
 * The cascade_delete parameter controls deletion behavior:
 * - When false (default): Fails with 409 Conflict if the resource has child resources or role assignments
 * - When true: Deletes the resource and all descendants, including their role assignments
 *
 * This is a breaking change from previous behavior where deletion always cascaded.
 */
export interface DeleteAuthorizationResourceOptions {
  /**
   * Whether to cascade delete child resources and role assignments.
   * - false (default): Returns 409 Conflict if dependencies exist
   * - true: Deletes resource and all descendants with their role assignments
   */
  cascadeDelete?: boolean;
}

/**
 * Options for deleting an authorization resource by external ID
 * Matches API: DELETE /authorization/organizations/:org_id/resources/:type_slug/:external_id
 *
 * The cascade_delete parameter controls deletion behavior:
 * - When false (default): Fails with 409 Conflict if the resource has child resources or role assignments
 * - When true: Deletes the resource and all descendants, including their role assignments
 */
export interface DeleteResourceByExternalIdOptions {
  /** The organization ID (required, used in URL path) */
  organizationId: string;
  /** The resource type slug (required, used in URL path) */
  resourceTypeSlug: string;
  /** The external ID of the resource (required, used in URL path) */
  externalId: string;
  /**
   * Whether to cascade delete child resources and role assignments.
   * - false (default): Returns 409 Conflict if dependencies exist
   * - true: Deletes resource and all descendants with their role assignments
   */
  cascadeDelete?: boolean;
}
