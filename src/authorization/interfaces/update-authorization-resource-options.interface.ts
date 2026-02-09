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
 * Serialized format for API request (snake_case).
 */
export interface SerializedUpdateAuthorizationResourceOptions {
  name?: string;
  description?: string | null;
}
