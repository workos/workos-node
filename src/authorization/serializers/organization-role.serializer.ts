import {
  Role,
  OrganizationRoleResponse,
  OrganizationRoleEvent,
  OrganizationRoleEventResponse,
} from '../../roles/interfaces';
import { OrganizationRole } from '../interfaces';

export const deserializeRole = (role: OrganizationRoleResponse): Role => ({
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

export const deserializeOrganizationRole = (
  role: OrganizationRoleResponse,
): OrganizationRole => ({
  object: role.object,
  id: role.id,
  name: role.name,
  slug: role.slug,
  description: role.description,
  permissions: role.permissions,
  type: 'OrganizationRole',
  createdAt: role.created_at,
  updatedAt: role.updated_at,
});

export const deserializeOrganizationRoleEvent = (
  role: OrganizationRoleEventResponse,
): OrganizationRoleEvent => ({
  object: role.object,
  organizationId: role.organization_id,
  slug: role.slug,
  name: role.name,
  description: role.description,
  resourceTypeSlug: role.resource_type_slug,
  permissions: role.permissions,
  createdAt: role.created_at,
  updatedAt: role.updated_at,
});
