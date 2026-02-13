import {
  BaseOrganizationMembership,
  BaseOrganizationMembershipResponse,
  OrganizationMembership,
  OrganizationMembershipResponse,
} from '../interfaces/organization-membership.interface';

export const deserializeBaseOrganizationMembership = (
  organizationMembership: BaseOrganizationMembershipResponse,
): BaseOrganizationMembership => ({
  object: organizationMembership.object,
  id: organizationMembership.id,
  userId: organizationMembership.user_id,
  organizationId: organizationMembership.organization_id,
  organizationName: organizationMembership.organization_name,
  status: organizationMembership.status,
  createdAt: organizationMembership.created_at,
  updatedAt: organizationMembership.updated_at,
  customAttributes: organizationMembership.custom_attributes ?? {},
});

export const deserializeOrganizationMembership = (
  organizationMembership: OrganizationMembershipResponse,
): OrganizationMembership => ({
  ...deserializeBaseOrganizationMembership(organizationMembership),
  ...(organizationMembership.role && { role: organizationMembership.role }),
  ...(organizationMembership.roles && { roles: organizationMembership.roles }),
});
