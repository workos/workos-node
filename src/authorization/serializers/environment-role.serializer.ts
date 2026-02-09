import {
  EnvironmentRole,
  EnvironmentRoleResponse,
} from '../interfaces/environment-role.interface';

export const deserializeEnvironmentRole = (
  role: EnvironmentRoleResponse,
): EnvironmentRole => ({
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
