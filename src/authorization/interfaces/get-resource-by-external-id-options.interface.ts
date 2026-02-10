/**
 * Options for getting a resource by its external ID.
 *
 * Uses the organization + resource type + external ID path format
 * to uniquely identify a resource.
 */
export interface GetResourceByExternalIdOptions {
  /** The organization ID that owns the resource */
  organizationId: string;
  /** The resource type slug (e.g., 'document', 'folder') */
  resourceTypeSlug: string;
  /** The external ID of the resource */
  externalId: string;
}
