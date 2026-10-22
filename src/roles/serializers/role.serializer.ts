import { OrganizationRoleResponse, Role } from '../interfaces';

export const deserializeRole = (role: OrganizationRoleResponse): Role => ({
  object: role.object,
  id: role.id,
  name: role.name,
  slug: role.slug,
  description: role.description,
  permissions: role.permissions,
  resourceTypeSlug: role.resource_type_slug,
  type: role.type,
  createdAt: new Date(role.created_at),
  updatedAt: new Date(role.updated_at),
});
