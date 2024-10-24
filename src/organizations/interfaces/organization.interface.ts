import {
  OrganizationDomain,
  OrganizationDomainResponse,
} from '../../organization-domains/interfaces/organization-domain.interface';

export interface Organization {
  object: 'organization';
  id: string;
  name: string;
  allowProfilesOutsideOrganization: boolean;
  domains: OrganizationDomain[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationResponse {
  object: 'organization';
  id: string;
  name: string;
  allow_profiles_outside_organization: boolean;
  domains: OrganizationDomainResponse[];
  created_at: string;
  updated_at: string;
}
