import {
  OrganizationDomainVerificationFailed,
  OrganizationDomainVerificationFailedResponse,
} from '../interfaces';
import { deserializeOrganizationDomain } from './organization-domain.serializer';

export const deserializeOrganizationDomainVerificationFailed = (
  organizationDomainVerificationFailed: OrganizationDomainVerificationFailedResponse,
): OrganizationDomainVerificationFailed => ({
  reason: organizationDomainVerificationFailed.reason,
  organizationDomain: deserializeOrganizationDomain(
    organizationDomainVerificationFailed.organization_domain,
  ),
});
