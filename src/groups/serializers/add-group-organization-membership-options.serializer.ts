import {
  AddGroupOrganizationMembershipOptions,
  SerializedAddGroupOrganizationMembershipOptions,
} from '../interfaces';

export const serializeAddGroupOrganizationMembershipOptions = (
  options: AddGroupOrganizationMembershipOptions,
): SerializedAddGroupOrganizationMembershipOptions => ({
  organization_membership_id: options.organizationMembershipId,
});
