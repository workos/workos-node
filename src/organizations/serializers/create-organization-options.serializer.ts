import {
  CreateOrganizationOptions,
  SerializedCreateOrganizationOptions,
} from '../interfaces';

export const serializeCreateOrganizationOptions = (
  options: CreateOrganizationOptions,
): SerializedCreateOrganizationOptions => ({
  name: options.name,
  domain_data: options.domainData,
  external_id: options.externalId,
  metadata: options.metadata,
});
