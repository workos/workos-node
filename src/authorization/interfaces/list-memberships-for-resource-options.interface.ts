/**
 * Options for listing organization memberships that have access to a resource (by internal ID)
 * Matches API: GET /authorization/resources/:resource_id/organization_memberships
 */
export interface ListMembershipsForResourceOptions {
  /** The internal resource ID (required, used in URL path) */
  resourceId: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Cursor for pagination - fetch results after this cursor */
  after?: string;
  /** Cursor for pagination - fetch results before this cursor */
  before?: string;
  /** Sort order for results */
  order?: 'asc' | 'desc';
}
