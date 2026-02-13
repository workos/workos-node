import {
  UpdateAuthorizationResourceOptions,
  SerializedUpdateAuthorizationResourceOptions,
} from '../interfaces/authorization-resource.interface';

export const serializeUpdateResourceOptions = (
  options: UpdateAuthorizationResourceOptions,
): SerializedUpdateAuthorizationResourceOptions => ({
  ...(options.name !== undefined && { name: options.name }),
  ...(options.description !== undefined && {
    description: options.description,
  }),
});
