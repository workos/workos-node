import { OrganizationDomain, OrganizationDomainResponse } from '../interfaces';

export const deserializeOrganizationDomain = (
  organizationDomain: OrganizationDomainResponse,
): OrganizationDomain => ({
  object: organizationDomain.object,
  id: organizationDomain.id,
  domain: organizationDomain.domain,
  organizationId: organizationDomain.organization_id,
  state: organizationDomain.state,
  ...(organizationDomain.verification_token !== undefined && {
    verificationToken: organizationDomain.verification_token,
  }),
  verificationStrategy: organizationDomain.verification_strategy,
  createdAt: organizationDomain.created_at,
  updatedAt: organizationDomain.updated_at,
});
