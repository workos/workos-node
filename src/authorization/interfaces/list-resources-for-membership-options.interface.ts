/**
 * Options for listing resources accessible to an organization membership
 * Matches API: GET /authorization/organization_memberships/:om_id/resources
 */
export interface ListResourcesForMembershipOptions {
  /** The organization membership ID (required, used in URL path) */
  organizationMembershipId: string;
  /** Filter by resource type slugs (comma-separated in API) */
  resourceTypeSlugs?: string[];
  /** Maximum number of results to return */
  limit?: number;
  /** Cursor for pagination - fetch results after this cursor */
  after?: string;
  /** Cursor for pagination - fetch results before this cursor */
  before?: string;
  /** Sort order for results */
  order?: 'asc' | 'desc';
}

export interface SerializedListResourcesForMembershipOptions {
  resource_type_slugs?: string;
  limit?: number;
  after?: string;
  before?: string;
  order?: 'asc' | 'desc';
}
