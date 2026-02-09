/**
 * Options for creating an authorization resource.
 */
export interface CreateAuthorizationResourceOptions {
  /** The organization this resource belongs to. */
  organizationId: string;
  /** The slug of the resource type (e.g., 'document', 'folder'). */
  resourceTypeSlug: string;
  /** External identifier for this resource (max 64 chars, ASCII only). */
  externalId: string;
  /** Display name for the resource (max 48 chars). */
  name: string;
  /** Optional description (max 150 chars). */
  description?: string;
  /** Optional parent resource ID for hierarchical resources. */
  parentResourceId?: string;
}

/**
 * Serialized format for create request (snake_case).
 */
export interface SerializedCreateAuthorizationResourceOptions {
  organization_id: string;
  resource_type_slug: string;
  external_id: string;
  name: string;
  description?: string;
  parent_resource_id?: string;
}

/**
 * Options for updating an authorization resource.
 */
export interface UpdateAuthorizationResourceOptions {
  /** The resource ID to update. */
  resourceId: string;
  /** Updated display name (max 48 chars). */
  name?: string;
  /** Updated description (max 150 chars). Set to null to clear. */
  description?: string | null;
}

/**
 * Serialized format for update request (snake_case).
 */
export interface SerializedUpdateAuthorizationResourceOptions {
  name?: string;
  description?: string | null;
}
