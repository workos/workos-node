import {
  UpdatePermissionOptions,
  SerializedUpdatePermissionOptions,
} from '../interfaces/update-permission-options.interface';

export const serializeUpdatePermissionOptions = (
  options: UpdatePermissionOptions,
): SerializedUpdatePermissionOptions => ({
  name: options.name,
  description: options.description,
});
