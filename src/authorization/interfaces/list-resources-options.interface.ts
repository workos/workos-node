/**
 * Options for listing authorization resources
 * Matches API: GET /authorization/resources
 */
export interface ListAuthorizationResourcesOptions {
  /** Filter by organization IDs (will be comma-separated in API request) */
  organizationIds?: string[];
  /** Filter by resource type slugs (will be comma-separated in API request) */
  resourceTypeSlugs?: string[];
  /** Filter by parent resource ID */
  parentResourceId?: string;
  /** Filter by parent resource type slug (used with parentExternalId) */
  parentResourceTypeSlug?: string;
  /** Filter by parent external ID (requires parentResourceTypeSlug) */
  parentExternalId?: string;
  /** Search filter for resource name */
  search?: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Cursor for pagination - fetch results after this cursor */
  after?: string;
  /** Cursor for pagination - fetch results before this cursor */
  before?: string;
  /** Sort order for results */
  order?: 'asc' | 'desc';
}

/**
 * Serialized query parameters for the API request (snake_case)
 */
export interface SerializedListAuthorizationResourcesOptions {
  organization_ids?: string;
  resource_type_slugs?: string;
  parent_resource_id?: string;
  parent_resource_type_slug?: string;
  parent_external_id?: string;
  search?: string;
  limit?: number;
  after?: string;
  before?: string;
  order?: 'asc' | 'desc';
}

/**
 * Paginated list of authorization resources (SDK type)
 */
export interface AuthorizationResourceList {
  object: 'list';
  data: import('./authorization-resource.interface').AuthorizationResource[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

/**
 * Paginated list of authorization resources (API response type)
 */
export interface AuthorizationResourceListResponse {
  object: 'list';
  data: import('./authorization-resource.interface').AuthorizationResourceResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}
