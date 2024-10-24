import { deserializeOrganizationDomain } from '../../organization-domains/serializers/organization-domain.serializer';
import { Organization, OrganizationResponse } from '../interfaces';

export const deserializeOrganization = (
  organization: OrganizationResponse,
): Organization => ({
  object: organization.object,
  id: organization.id,
  name: organization.name,
  allowProfilesOutsideOrganization:
    organization.allow_profiles_outside_organization,
  domains: organization.domains.map(deserializeOrganizationDomain),
  createdAt: organization.created_at,
  updatedAt: organization.updated_at,
});
