import {
  Permission,
  PermissionResponse,
} from '../interfaces/permission.interface';

export const deserializePermission = (
  permission: PermissionResponse,
): Permission => ({
  object: permission.object,
  id: permission.id,
  slug: permission.slug,
  name: permission.name,
  description: permission.description,
  resourceTypeSlug: permission.resource_type_slug,
  system: permission.system,
  createdAt: new Date(permission.created_at),
  updatedAt: new Date(permission.updated_at),
});
