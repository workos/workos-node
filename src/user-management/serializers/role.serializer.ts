import { RoleEvent, RoleEventResponse } from '../interfaces';

export const deserializeRole = (role: RoleEventResponse): RoleEvent => ({
  object: 'role',
  slug: role.slug,
  createdAt: role.created_at,
  updatedAt: role.updated_at,
});
