export interface UpdateOrganizationMembershipOptions<TRole extends string = string> {
  roleSlug?: TRole;
}

export interface SerializedUpdateOrganizationMembershipOptions<TRole extends string = string> {
  role_slug?: TRole;
}
