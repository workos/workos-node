import {
  OrganizationRole,
  OrganizationRoleResponse,
} from '../interfaces/organization-role.interface';

export const deserializeOrganizationRole = (
  role: OrganizationRoleResponse,
): OrganizationRole => ({
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
