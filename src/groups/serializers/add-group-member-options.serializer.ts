import {
  AddGroupMemberOptions,
  SerializedAddGroupMemberOptions,
} from '../interfaces';

export const serializeAddGroupMemberOptions = (
  options: AddGroupMemberOptions,
): SerializedAddGroupMemberOptions => ({
  organization_membership_id: options.organizationMembershipId,
});
