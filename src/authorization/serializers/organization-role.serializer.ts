import { Role, OrganizationRoleResponse } from '../../roles/interfaces';
import { OrganizationRole } from '../interfaces';

export const deserializeRole = (role: OrganizationRoleResponse): Role => ({
  object: role.object,
  id: role.id,
  name: role.name,
  slug: role.slug,
  description: role.description,
  permissions: role.permissions,
  type: role.type,
  createdAt: role.created_at,
  updatedAt: role.updated_at,
});

export const deserializeOrganizationRole = (
  role: OrganizationRoleResponse,
): OrganizationRole => ({
  object: role.object,
  id: role.id,
  name: role.name,
  slug: role.slug,
  description: role.description,
  permissions: role.permissions,
  type: 'OrganizationRole',
  createdAt: role.created_at,
  updatedAt: role.updated_at,
});
