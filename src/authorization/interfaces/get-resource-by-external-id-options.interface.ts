/**
 * Options for getting an authorization resource by external ID
 * Matches API: GET /authorization/organizations/:org_id/resources/:type_slug/:external_id
 */
export interface GetResourceByExternalIdOptions {
  /** The organization ID (required, used in URL path) */
  organizationId: string;
  /** The resource type slug (required, used in URL path) */
  resourceTypeSlug: string;
  /** The external ID of the resource (required, used in URL path) */
  externalId: string;
}
