export interface CreateOrganizationOptions {
  name: string;
  allow_profiles_outside_organization?: boolean;
  domains?: string[];
}
