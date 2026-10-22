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
  resourceTypeSlug: role.resource_type_slug,
  type: role.type,
  createdAt: new Date(role.created_at),
  updatedAt: new Date(role.updated_at),
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
  resourceTypeSlug: role.resource_type_slug,
  type: 'OrganizationRole',
  createdAt: new Date(role.created_at),
  updatedAt: new Date(role.updated_at),
});

export const deserializeOrganizationRoleEvent = (
  event: OrganizationRoleEventResponse,
): OrganizationRoleEvent => ({
  object: event.object,
  organizationId: event.organization_id,
  slug: event.slug,
  name: event.name,
  description: event.description,
  resourceTypeSlug: event.resource_type_slug,
  permissions: event.permissions,
  createdAt: new Date(event.created_at),
  updatedAt: new Date(event.updated_at),
});
