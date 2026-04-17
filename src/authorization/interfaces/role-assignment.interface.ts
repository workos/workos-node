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
  object: 'role_assignment';
  id: string;
  role: RoleAssignmentRole;
  resource: RoleAssignmentResource;
  createdAt: string;
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
