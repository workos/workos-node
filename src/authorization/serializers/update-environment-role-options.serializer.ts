import {
  UpdateEnvironmentRoleOptions,
  SerializedUpdateEnvironmentRoleOptions,
} from '../interfaces/update-environment-role-options.interface';

export const serializeUpdateEnvironmentRoleOptions = (
  options: UpdateEnvironmentRoleOptions,
): SerializedUpdateEnvironmentRoleOptions => ({
  name: options.name,
  description: options.description,
});
