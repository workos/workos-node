import { DomainData } from './domain-data.interface';

export interface UpdateOrganizationOptions {
  organization: string;
  name?: string;
  domainData?: DomainData[];
  stripeCustomerId?: string | null;
  externalId?: string | null;
  metadata?: Record<string, string>;
}

export interface SerializedUpdateOrganizationOptions {
  name?: string;
  domain_data?: DomainData[];
  stripe_customer_id?: string | null;
  external_id?: string | null;
  metadata?: Record<string, string>;
}
