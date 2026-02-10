/**
 * Options for deleting a resource by its external ID.
 *
 * Uses the organization + resource type + external ID path format
 * to uniquely identify the resource to delete.
 */
export interface DeleteResourceByExternalIdOptions {
  /** The organization ID that owns the resource */
  organizationId: string;
  /** The resource type slug (e.g., 'document', 'folder') */
  resourceTypeSlug: string;
  /** The external ID of the resource */
  externalId: string;
}
