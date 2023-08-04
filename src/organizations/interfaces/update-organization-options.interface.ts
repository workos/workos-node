export interface UpdateOrganizationOptions {
  organization: string;
  name: string;
  allowProfilesOutsideOrganization?: boolean;
  domains?: string[];
}

export interface SerializedUpdateOrganizationOptions {
  name: string;
  allow_profiles_outside_organization?: boolean;
  domains?: string[];
}
