import { RoleEvent, RoleEventResponse } from '../../roles/interfaces';

export const deserializeRoleEvent = (role: RoleEventResponse): RoleEvent => ({
  object: 'role',
  slug: role.slug,
});
