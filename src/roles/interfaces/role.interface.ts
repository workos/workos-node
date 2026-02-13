import {
  EnvironmentRole,
  OrganizationRole,
} from '../../authorization/interfaces';

export interface RoleResponse {
  slug: string;
}

export interface RoleEvent {
  object: 'role';
  slug: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleEventResponse {
  object: 'role';
  slug: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface OrganizationRoleEventResponse {
  object: 'organization_role';
  organization_id: string;
  slug: string;
  name: string;
  description: string | null;
  resource_type_slug: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface OrganizationRoleEvent {
  object: 'organization_role';
  organizationId: string;
  slug: string;
  name: string;
  description: string | null;
  resourceTypeSlug: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
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
  permissions: string[];
  type: 'EnvironmentRole' | 'OrganizationRole';
  created_at: string;
  updated_at: string;
}

export type Role = EnvironmentRole | OrganizationRole;

export interface RoleList {
  object: 'list';
  data: Role[];
}
