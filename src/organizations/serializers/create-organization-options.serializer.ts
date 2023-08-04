import {
  CreateOrganizationOptions,
  SerializedCreateOrganizationOptions,
} from '../interfaces';

export const serializeCreateOrganizationOptions = (
  options: CreateOrganizationOptions,
): SerializedCreateOrganizationOptions => ({
  name: options.name,
  allow_profiles_outside_organization: options.allowProfilesOutsideOrganization,
  domains: options.domains,
});
