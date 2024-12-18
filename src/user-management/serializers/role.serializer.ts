import { RoleEvent, RoleEventResponse } from '../../roles/interfaces';

export const deserializeRole = <TRole extends string = string>(
  role: RoleEventResponse<TRole>,
): RoleEvent<TRole> => ({
  object: 'role',
  slug: role.slug,
});
