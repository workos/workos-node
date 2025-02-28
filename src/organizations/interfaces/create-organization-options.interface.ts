import { PostOptions } from '../../common/interfaces';
import { DomainData } from './domain-data.interface';

export interface CreateOrganizationOptions {
  name: string;
  domainData?: DomainData[];
}

export interface SerializedCreateOrganizationOptions {
  name: string;
  domain_data?: DomainData[];
}

export interface CreateOrganizationRequestOptions
  extends Pick<PostOptions, 'idempotencyKey'> {}
