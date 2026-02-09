import {
  CreateOrganizationRoleOptions,
  SerializedCreateOrganizationRoleOptions,
} from '../interfaces/create-organization-role-options.interface';

export const serializeCreateOrganizationRoleOptions = (
  options: CreateOrganizationRoleOptions,
): SerializedCreateOrganizationRoleOptions => ({
  slug: options.slug,
  name: options.name,
  description: options.description,
});
