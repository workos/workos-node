import { UpdateAuthorizationResourceByExternalIdOptions } from '../interfaces/update-authorization-resource-by-external-id-options.interface';
import { SerializedUpdateAuthorizationResourceOptions } from '../interfaces/authorization-resource.interface';

export const serializeUpdateResourceByExternalIdOptions = (
  options: UpdateAuthorizationResourceByExternalIdOptions,
): SerializedUpdateAuthorizationResourceOptions => ({
  ...(options.name !== undefined && { name: options.name }),
  ...(options.description !== undefined && {
    description: options.description,
  }),
});
