import { OrganizationDomain } from './organization-domain.interface';

export interface Organization {
  object: 'organization';
  id: string;
  name: string;
  allow_profiles_outside_organization: boolean;
  domains: OrganizationDomain[];
  created_at: string;
  updated_at: string;
}
