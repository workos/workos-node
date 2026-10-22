import { RoleEvent, RoleEventResponse } from '../../roles/interfaces';

export const deserializeRoleEvent = (role: RoleEventResponse): RoleEvent => ({
  object: role.object,
  slug: role.slug,
  resourceTypeSlug: role.resource_type_slug,
  permissions: role.permissions,
  createdAt: new Date(role.created_at),
  updatedAt: new Date(role.updated_at),
});
