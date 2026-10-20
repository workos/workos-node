export interface RoleAssignmentRole {
  slug: string;
}

export interface RoleAssignmentResource {
  id: string;
  externalId: string;
  resourceTypeSlug: string;
}

export interface RoleAssignmentResourceResponse {
  id: string;
  external_id: string;
  resource_type_slug: string;
}

export interface RoleAssignmentSource {
  /** Whether the role was assigned directly or derived from a group. */
  type: 'direct' | 'group';
  /** The ID of the group role assignment the role was derived from, or null if direct. */
  groupRoleAssignmentId: string | null;
}

export interface RoleAssignmentSourceResponse {
  type: 'direct' | 'group';
  group_role_assignment_id: string | null;
}

export interface RoleAssignment {
  /** Distinguishes the role assignment object. */
  object: 'role_assignment';
  /** Unique identifier of the role assignment. */
  id: string;
  /** The ID of the organization membership the role is assigned to. */
  organizationMembershipId: string;
  /** The role included in the assignment. */
  role: RoleAssignmentRole;
  /** The resource to which the role is assigned. */
  resource: RoleAssignmentResource;
  /** The origin of the role assignment. */
  source: RoleAssignmentSource;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface RoleAssignmentResponse {
  object: 'role_assignment';
  id: string;
  organization_membership_id: string;
  role: RoleAssignmentRole;
  resource: RoleAssignmentResourceResponse;
  source: RoleAssignmentSourceResponse;
  created_at: string;
  updated_at: string;
}
