import { OrganizationDomain } from './organization-domain.interface';

export interface Organization {
  object: 'organization';
  id: string;
  name: string;
  domains: OrganizationDomain[];
}
