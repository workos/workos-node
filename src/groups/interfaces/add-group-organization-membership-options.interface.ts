export interface AddGroupOrganizationMembershipOptions {
  organizationId: string;
  groupId: string;
  organizationMembershipId: string;
}

export interface SerializedAddGroupOrganizationMembershipOptions {
  organization_membership_id: string;
}

export interface RemoveGroupOrganizationMembershipOptions {
  organizationId: string;
  groupId: string;
  organizationMembershipId: string;
}
