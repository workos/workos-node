import { RoleEvent, RoleEventResponse } from '../../roles/interfaces';

export const deserializeRoleEvent = (role: RoleEventResponse): RoleEvent => ({
  object: 'role',
  slug: role.slug,
  permissions: role.permissions,
  createdAt: role.created_at,
  updatedAt: role.updated_at,
});
