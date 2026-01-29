import {
  UpdateOrganizationRoleOptions,
  SerializedUpdateOrganizationRoleOptions,
} from '../interfaces/update-organization-role-options.interface';

export const serializeUpdateOrganizationRoleOptions = (
  options: UpdateOrganizationRoleOptions,
): SerializedUpdateOrganizationRoleOptions => ({
  name: options.name,
  description: options.description,
});
