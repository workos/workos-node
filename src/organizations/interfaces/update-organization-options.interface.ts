import { DomainData } from './domain-data.interface';

export interface UpdateOrganizationOptions {
  organization: string;
  name?: string;
  allowProfilesOutsideOrganization?: boolean;
  domainData?: DomainData[];
  stripeCustomerId?: string | null;
  externalId?: string | null;
  metadata?: Record<string, string>;
}

export interface SerializedUpdateOrganizationOptions {
  name?: string;
  allow_profiles_outside_organization?: boolean;
  domain_data?: DomainData[];
  stripe_customer_id?: string | null;
  external_id?: string | null;
  metadata?: Record<string, string>;
}
