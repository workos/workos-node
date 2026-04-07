import {
  OrganizationDomainVerificationFailed,
  OrganizationDomainVerificationFailedResponse,
} from '../interfaces';
import {
  deserializeOrganizationDomain,
  serializeOrganizationDomain,
} from './organization-domain.serializer';

export const deserializeOrganizationDomainVerificationFailed = (
  organizationDomainVerificationFailed: OrganizationDomainVerificationFailedResponse,
): OrganizationDomainVerificationFailed => ({
  reason: organizationDomainVerificationFailed.reason,
  organizationDomain: deserializeOrganizationDomain(
    organizationDomainVerificationFailed.organization_domain,
  ),
});

export const serializeOrganizationDomainVerificationFailed = (
  organizationDomainVerificationFailed: OrganizationDomainVerificationFailed,
): OrganizationDomainVerificationFailedResponse => ({
  reason: organizationDomainVerificationFailed.reason,
  organization_domain: serializeOrganizationDomain(
    organizationDomainVerificationFailed.organizationDomain,
  ),
});
