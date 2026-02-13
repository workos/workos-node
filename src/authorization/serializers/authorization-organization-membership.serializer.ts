import {
  AuthorizationOrganizationMembership,
  AuthorizationOrganizationMembershipResponse,
} from '../interfaces/organization-membership-list.interface';

export const deserializeAuthorizationOrganizationMembership = (
  organizationMembership: AuthorizationOrganizationMembershipResponse,
): AuthorizationOrganizationMembership => ({
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
