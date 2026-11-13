import {
  AuthorizationOrganizationMembership,
  AuthorizationOrganizationMembershipResponse,
  OrganizationMembership,
  OrganizationMembershipResponse,
} from '../interfaces/organization-membership.interface';
import { deserializeUser } from './user.serializer';

export const deserializeOrganizationMembership = (
  organizationMembership: OrganizationMembershipResponse,
): OrganizationMembership => ({
  object: organizationMembership.object,
  id: organizationMembership.id,
  userId: organizationMembership.user_id,
  organizationId: organizationMembership.organization_id,
  organizationName: organizationMembership.organization_name,
  status: organizationMembership.status,
  directoryManaged: organizationMembership.directory_managed ?? false,
  createdAt: new Date(organizationMembership.created_at),
  updatedAt: new Date(organizationMembership.updated_at),
  role: organizationMembership.role,
  ...(organizationMembership.roles && { roles: organizationMembership.roles }),
  customAttributes: organizationMembership.custom_attributes ?? {},
  ...(organizationMembership.user && {
    user: deserializeUser(organizationMembership.user),
  }),
});

export const deserializeAuthorizationOrganizationMembership = (
  organizationMembership: AuthorizationOrganizationMembershipResponse,
): AuthorizationOrganizationMembership => ({
  object: organizationMembership.object,
  id: organizationMembership.id,
  userId: organizationMembership.user_id,
  organizationId: organizationMembership.organization_id,
  status: organizationMembership.status,
  directoryManaged: organizationMembership.directory_managed ?? false,
  createdAt: new Date(organizationMembership.created_at),
  updatedAt: new Date(organizationMembership.updated_at),
  customAttributes: organizationMembership.custom_attributes ?? {},
});
