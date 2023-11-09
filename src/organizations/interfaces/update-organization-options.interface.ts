export interface UpdateOrganizationOptions {
  organization: string;
  name: string;
  allowProfilesOutsideOrganization?: boolean;
}

export interface SerializedUpdateOrganizationOptions {
  name: string;
  allow_profiles_outside_organization?: boolean;
}
