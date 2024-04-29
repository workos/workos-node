import {
  SerializedUpdateOrganizationOptions,
  UpdateOrganizationOptions,
} from '../interfaces';

export const serializeUpdateOrganizationOptions = (
  options: Omit<UpdateOrganizationOptions, 'organization'>,
): SerializedUpdateOrganizationOptions => ({
  name: options.name,
  allow_profiles_outside_organization: options.allowProfilesOutsideOrganization,
  domain_data: options.domainData,
  domains: options.domains,
});
