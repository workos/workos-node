import { PostOptions } from '../../common/interfaces';
import { DomainData } from './domain-data.interface';

export interface CreateOrganizationOptions {
  name: string;
  domainData?: DomainData[];
  externalId?: string | null;
  metadata?: Record<string, string>;
}

export interface SerializedCreateOrganizationOptions {
  name: string;
  domain_data?: DomainData[];
  external_id?: string | null;
  metadata?: Record<string, string>;
}

export type CreateOrganizationRequestOptions = Pick<
  PostOptions,
  'idempotencyKey'
>;
