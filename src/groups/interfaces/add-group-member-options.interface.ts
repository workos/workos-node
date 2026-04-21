export interface AddGroupMemberOptions {
  organizationId: string;
  groupId: string;
  organizationMembershipId: string;
}

export interface SerializedAddGroupMemberOptions {
  organization_membership_id: string;
}

export interface RemoveGroupMemberOptions {
  organizationId: string;
  groupId: string;
  organizationMembershipId: string;
}
