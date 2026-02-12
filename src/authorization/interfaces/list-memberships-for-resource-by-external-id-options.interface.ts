/**
 * Options for listing organization memberships that have access to a resource (by external ID)
 * Matches API: GET /authorization/organizations/:org_id/resources/:type/:external_id/organization_memberships
 */
export interface ListMembershipsForResourceByExternalIdOptions {
  /** The organization ID (required, used in URL path) */
  organizationId: string;
  /** The resource type slug (required, used in URL path) */
  resourceTypeSlug: string;
  /** The external resource ID (required, used in URL path) */
  externalId: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Cursor for pagination - fetch results after this cursor */
  after?: string;
  /** Cursor for pagination - fetch results before this cursor */
  before?: string;
  /** Sort order for results */
  order?: 'asc' | 'desc';
}
