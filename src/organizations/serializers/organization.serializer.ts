import { Organization, OrganizationResponse } from '../interfaces';

export const deserializeOrganization = (
  organization: OrganizationResponse,
): Organization => ({
  object: organization.object,
  id: organization.id,
  name: organization.name,
  createdAt: organization.created_at,
  updatedAt: organization.updated_at,
});
