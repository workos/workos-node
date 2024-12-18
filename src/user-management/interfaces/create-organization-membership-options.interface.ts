export interface CreateOrganizationMembershipOptions<TRole extends string = string> {
  organizationId: string;
  userId: string;
  roleSlug?: TRole;
}

export interface SerializedCreateOrganizationMembershipOptions<TRole extends string = string> {
  organization_id: string;
  user_id: string;
  role_slug?: TRole;
}
