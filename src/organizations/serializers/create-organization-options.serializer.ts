import {
  CreateOrganizationOptions,
  SerializedCreateOrganizationOptions,
} from '../interfaces';

export const serializeCreateOrganizationOptions = (
  options: CreateOrganizationOptions,
): SerializedCreateOrganizationOptions => ({
  name: options.name,
  allow_profiles_outside_organization: options.allowProfilesOutsideOrganization,
  domain_data: options.domainData,
  domains: options.domains,
  external_id: options.externalId,
  metadata: options.metadata,
});
