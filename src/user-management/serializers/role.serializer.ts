import { RoleEvent, RoleEventResponse } from '../../roles/interfaces';

export const deserializeRole = (role: RoleEventResponse): RoleEvent => ({
  object: 'role',
  slug: role.slug,
});
