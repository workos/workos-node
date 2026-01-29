export interface OrganizationRole {
  object: 'role';
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  type: 'OrganizationRole';
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationRoleResponse {
  object: 'role';
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  type: 'OrganizationRole';
  created_at: string;
  updated_at: string;
}

export interface OrganizationRoleList {
  object: 'list';
  data: OrganizationRole[];
}

export interface OrganizationRoleListResponse {
  object: 'list';
  data: OrganizationRoleResponse[];
}
