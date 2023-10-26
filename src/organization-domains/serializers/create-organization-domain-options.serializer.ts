import {
  CreateOrganizationDomainOptions,
  SerializedCreateOrganizationDomainOptions,
} from '../interfaces';

export const serializeCreateOrganizationDomainOptions = (
  options: CreateOrganizationDomainOptions,
): SerializedCreateOrganizationDomainOptions => ({
  domain: options.domain,
  organization_id: options.organizationId,
});
