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

export type CreateOrganizationRequestOptions = Pick<
  PostOptions,
  'idempotencyKey'
>;
