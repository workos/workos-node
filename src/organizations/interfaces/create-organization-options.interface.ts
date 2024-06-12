import { PostOptions } from '../../common/interfaces';
import { DomainData } from './domain-data.interface';

export interface CreateOrganizationOptions {
  name: string;
  domainData?: DomainData[];

  /**
  * @deprecated Contact support@workos.com to enable the replacement for this setting.
  */
  allowProfilesOutsideOrganization?: boolean;
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
}

export interface SerializedCreateOrganizationOptions {
  name: string;
  domain_data?: DomainData[];

  /**
  * @deprecated Contact support@workos.com to enable the replacement for this setting.
  */
  allow_profiles_outside_organization?: boolean;
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
}

export interface CreateOrganizationRequestOptions
  extends Pick<PostOptions, 'idempotencyKey'> {}
