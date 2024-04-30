import { PostOptions } from '../../common/interfaces';
import { DomainData } from './domain-data.interface';

export interface CreateOrganizationOptions {
  name: string;
  allowProfilesOutsideOrganization?: boolean;
  domainData?: DomainData[];
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
}

export interface SerializedCreateOrganizationOptions {
  name: string;
  allow_profiles_outside_organization?: boolean;
  domain_data?: DomainData[];
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
}

export interface CreateOrganizationRequestOptions
  extends Pick<PostOptions, 'idempotencyKey'> {}
