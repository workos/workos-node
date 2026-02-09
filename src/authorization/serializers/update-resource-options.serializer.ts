import {
  UpdateAuthorizationResourceOptions,
  SerializedUpdateAuthorizationResourceOptions,
} from '../interfaces/authorization-resource.interface';

export const serializeUpdateResourceOptions = (
  options: UpdateAuthorizationResourceOptions,
): SerializedUpdateAuthorizationResourceOptions => ({
  name: options.name,
  description: options.description,
});
