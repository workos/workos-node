/**
 * Result of an authorization check.
 * Returns whether the organization membership has the specified permission on the resource.
 */
export interface AuthorizationCheckResult {
  /** True if the organization membership has the permission on the resource */
  authorized: boolean;
}
