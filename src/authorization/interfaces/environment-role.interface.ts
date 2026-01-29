export interface EnvironmentRole {
  object: 'role';
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  type: 'EnvironmentRole';
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentRoleResponse {
  object: 'role';
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  type: 'EnvironmentRole';
  created_at: string;
  updated_at: string;
}

export interface EnvironmentRoleList {
  object: 'list';
  data: EnvironmentRole[];
}

export interface EnvironmentRoleListResponse {
  object: 'list';
  data: EnvironmentRoleResponse[];
}
