import { DomainData } from './domain-data.interface';

export interface UpdateOrganizationOptions {
  organization: string;
  name: string;
  allowProfilesOutsideOrganization?: boolean;
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
  domain_data?: DomainData[];
}

export interface SerializedUpdateOrganizationOptions {
  name: string;
  allow_profiles_outside_organization?: boolean;
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
  domain_data?: DomainData[];
}
