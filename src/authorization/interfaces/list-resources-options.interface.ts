/**
 * Options for listing authorization resources.
 *
 * Supports filtering by organization, resource type, parent resource,
 * and search. Arrays are converted to comma-separated strings for the API.
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
  /** Filter by parent external ID (used with parentResourceTypeSlug) */
  parentExternalId?: string;
  /** Search filter for resource names */
  search?: string;
  /** Maximum number of results per page */
  limit?: number;
  /** Cursor for forward pagination */
  after?: string;
  /** Cursor for backward pagination */
  before?: string;
  /** Sort order for results */
  order?: 'asc' | 'desc';
}

/**
 * Serialized format for API request query parameters.
 * Array fields are converted to comma-separated strings.
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
