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

export interface RoleAssignment {
  /** Distinguishes the role assignment object. */
  object: 'role_assignment';
  /** Unique identifier of the role assignment. */
  id: string;
  /** The role included in the assignment. */
  role: RoleAssignmentRole;
  /** The resource to which the role is assigned. */
  resource: RoleAssignmentResource;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface RoleAssignmentResponse {
  object: 'role_assignment';
  id: string;
  role: RoleAssignmentRole;
  resource: RoleAssignmentResourceResponse;
  created_at: string;
  updated_at: string;
}
