import {
  AuthorizationOrganizationMembership,
  AuthorizationOrganizationMembershipResponse,
} from '../interfaces/organization-membership-list.interface';

export const deserializeAuthorizationOrganizationMembership = (
  membership: AuthorizationOrganizationMembershipResponse,
): AuthorizationOrganizationMembership => ({
  object: membership.object,
  id: membership.id,
  userId: membership.user_id,
  organizationId: membership.organization_id,
  organizationName: membership.organization_name,
  status: membership.status,
  createdAt: membership.created_at,
  updatedAt: membership.updated_at,
  customAttributes: membership.custom_attributes ?? {},
});
