import { DomainData } from './domain-data.interface';

export interface UpdateOrganizationOptions {
  organization: string;
  name?: string;
  domainData?: DomainData[];
  stripeCustomerId?: string | null;
}

export interface SerializedUpdateOrganizationOptions {
  name?: string;
  domain_data?: DomainData[];
  stripe_customer_id?: string | null;
}
