import { PostOptions } from '../../common/interfaces';
import { DomainData } from './domain-data.interface';

export interface CreateOrganizationOptions {
  name: string;
  allowProfilesOutsideOrganization?: boolean;
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
  domain_data?: DomainData[];
}

export interface SerializedCreateOrganizationOptions {
  name: string;
  allow_profiles_outside_organization?: boolean;
  /**
   * @deprecated Use `domain_data` instead.
   */
  domains?: string[];
  domain_data?: DomainData[];
}

export interface CreateOrganizationRequestOptions
  extends Pick<PostOptions, 'idempotencyKey'> {}
