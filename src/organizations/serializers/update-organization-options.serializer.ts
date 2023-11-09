import {
  SerializedUpdateOrganizationOptions,
  UpdateOrganizationOptions,
} from '../interfaces';

export const serializeUpdateOrganizationOptions = (
  options: Omit<UpdateOrganizationOptions, 'organization'>,
): SerializedUpdateOrganizationOptions => ({
  name: options.name,
});
