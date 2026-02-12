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
  role: RoleAssignmentRole; // Note: role.slug is already snake_case compatible
  resource: RoleAssignmentResourceResponse;
  created_at: string;
  updated_at: string;
}

export interface RoleAssignmentList {
  object: 'list';
  data: RoleAssignment[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

export interface RoleAssignmentListResponse {
  object: 'list';
  data: RoleAssignmentResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}
