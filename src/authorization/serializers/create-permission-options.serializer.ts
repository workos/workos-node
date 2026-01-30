import {
  CreatePermissionOptions,
  SerializedCreatePermissionOptions,
} from '../interfaces/create-permission-options.interface';

export const serializeCreatePermissionOptions = (
  options: CreatePermissionOptions,
): SerializedCreatePermissionOptions => ({
  slug: options.slug,
  name: options.name,
  description: options.description,
});
