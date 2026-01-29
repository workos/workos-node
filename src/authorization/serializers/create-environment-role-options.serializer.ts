import {
  CreateEnvironmentRoleOptions,
  SerializedCreateEnvironmentRoleOptions,
} from '../interfaces/create-environment-role-options.interface';

export const serializeCreateEnvironmentRoleOptions = (
  options: CreateEnvironmentRoleOptions,
): SerializedCreateEnvironmentRoleOptions => ({
  slug: options.slug,
  name: options.name,
  description: options.description,
});
