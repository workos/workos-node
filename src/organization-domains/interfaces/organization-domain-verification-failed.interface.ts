import {
  OrganizationDomain,
  OrganizationDomainResponse,
} from './organization-domain.interface';

export interface OrganizationDomainVerificationFailed {
  reason: string;
  organizationDomain: OrganizationDomain;
}

export interface OrganizationDomainVerificationFailedResponse {
  reason: string;
  organization_domain: OrganizationDomainResponse;
}
