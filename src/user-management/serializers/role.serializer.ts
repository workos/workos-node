import { RoleEvent, RoleEventResponse } from '../../roles/interfaces';

export const deserializeRoleEvent = (role: RoleEventResponse): RoleEvent => ({
  object: role.object,
  slug: role.slug,
  resourceTypeSlug: role.resource_type_slug,
  permissions: role.permissions,
  createdAt: role.created_at,
  updatedAt: role.updated_at,
});
