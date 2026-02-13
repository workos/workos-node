import {
  AuthorizationOrganizationMembership,
  AuthorizationOrganizationMembershipResponse,
  OrganizationMembership,
  OrganizationMembershipResponse,
} from '../interfaces/organization-membership.interface';

export const deserializeOrganizationMembership = (
  organizationMembership: OrganizationMembershipResponse,
): OrganizationMembership => ({
  object: organizationMembership.object,
  id: organizationMembership.id,
  userId: organizationMembership.user_id,
  organizationId: organizationMembership.organization_id,
  organizationName: organizationMembership.organization_name,
  status: organizationMembership.status,
  createdAt: organizationMembership.created_at,
  updatedAt: organizationMembership.updated_at,
  role: organizationMembership.role,
  ...(organizationMembership.roles && { roles: organizationMembership.roles }),
  customAttributes: organizationMembership.custom_attributes ?? {},
});

export const deserializeAuthorizationOrganizationMembership = (
  organizationMembership: AuthorizationOrganizationMembershipResponse,
): AuthorizationOrganizationMembership => ({
  object: organizationMembership.object,
  id: organizationMembership.id,
  userId: organizationMembership.user_id,
  organizationId: organizationMembership.organization_id,
  status: organizationMembership.status,
  createdAt: organizationMembership.created_at,
  updatedAt: organizationMembership.updated_at,
  customAttributes: organizationMembership.custom_attributes ?? {},
});
