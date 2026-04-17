import { serializePaginationOptions } from '../../common/serializers';
import { ListEffectivePermissionsOptions } from '../interfaces/list-effective-permissions-options.interface';
import { ListEffectivePermissionsByExternalIdOptions } from '../interfaces/list-effective-permissions-by-external-id-options.interface';

type ListEffectivePermissionsQueryOptions =
  | ListEffectivePermissionsOptions
  | ListEffectivePermissionsByExternalIdOptions;

export const serializeListEffectivePermissionsOptions = (
  options: ListEffectivePermissionsQueryOptions,
): Record<string, string | number> => ({
  ...serializePaginationOptions(options),
});
