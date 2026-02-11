/**
 * Options for updating an authorization resource by external ID
 * Matches API: PATCH /authorization/organizations/:org_id/resources/:type_slug/:external_id
 */
export interface UpdateResourceByExternalIdOptions {
  /** The organization ID (required, used in URL path) */
  organizationId: string;
  /** The resource type slug (required, used in URL path) */
  resourceTypeSlug: string;
  /** The external ID of the resource (required, used in URL path) */
  externalId: string;
  /** New name for the resource */
  name?: string;
  /** New description for the resource (pass null to clear) */
  description?: string | null;
}
