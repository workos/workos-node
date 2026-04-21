import {
  AddGroupOrganizationMembershipOptions,
  SerializedAddGroupOrganizationMembershipOptions,
} from '../interfaces';

export const serializeAddGroupOrganizationMembershipOptions = (
  options: Omit<
    AddGroupOrganizationMembershipOptions,
    'organizationId' | 'groupId'
  >,
): SerializedAddGroupOrganizationMembershipOptions => ({
  organization_membership_id: options.organizationMembershipId,
});
