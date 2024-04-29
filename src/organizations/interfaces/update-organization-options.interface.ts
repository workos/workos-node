import { DomainData } from './domain-data.interface';

export interface UpdateOrganizationOptions {
  organization: string;
  name: string;
  allowProfilesOutsideOrganization?: boolean;
  domainData?: DomainData[];
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
}

export interface SerializedUpdateOrganizationOptions {
  name: string;
  allow_profiles_outside_organization?: boolean;
  domain_data?: DomainData[];
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
}
