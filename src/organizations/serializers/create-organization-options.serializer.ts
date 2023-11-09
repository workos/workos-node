import {
  CreateOrganizationOptions,
  SerializedCreateOrganizationOptions,
} from '../interfaces';

export const serializeCreateOrganizationOptions = (
  options: CreateOrganizationOptions,
): SerializedCreateOrganizationOptions => ({
  name: options.name,
});
