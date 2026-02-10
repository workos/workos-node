/**
 * Options for updating a resource by its external ID.
 *
 * Uses the organization + resource type + external ID path format.
 * At least one of name or description must be provided.
 */
export interface UpdateResourceByExternalIdOptions {
  /** The organization ID that owns the resource */
  organizationId: string;
  /** The resource type slug (e.g., 'document', 'folder') */
  resourceTypeSlug: string;
  /** The external ID of the resource */
  externalId: string;
  /** New name for the resource (optional) */
  name?: string;
  /** New description for the resource (optional, null to clear) */
  description?: string | null;
}
