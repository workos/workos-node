export interface RoleResponse {
  slug: string;
}

export interface RoleEvent {
  object: 'role';
  slug: string;
}

export interface RoleEventResponse {
  object: 'role';
  slug: string;
}

export interface ListOrganizationRolesResponse {
  object: 'list';
  data: OrganizationRoleResponse[];
}

export interface OrganizationRoleResponse {
  object: 'role';
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'EnvironmentRole' | 'OrganizationRole';
  created_at: string;
  updated_at: string;
}

export interface Role {
  object: 'role';
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'EnvironmentRole' | 'OrganizationRole';
  createdAt: string;
  updatedAt: string;
}

export interface RoleList {
  object: 'list';
  data: Role[];
}
