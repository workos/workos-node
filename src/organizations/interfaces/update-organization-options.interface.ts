import { DomainData } from './domain-data.interface';

export interface UpdateOrganizationOptions {
  organization: string;
  name?: string;
  domainData?: DomainData[];

  /**
   * @deprecated If you need to allow sign-ins from any email domain, contact support@workos.com.
   */
  allowProfilesOutsideOrganization?: boolean;
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
}

export interface SerializedUpdateOrganizationOptions {
  name?: string;
  domain_data?: DomainData[];

  /**
   * @deprecated If you need to allow sign-ins from any email domain, contact support@workos.com.
   */
  allow_profiles_outside_organization?: boolean;
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
}
