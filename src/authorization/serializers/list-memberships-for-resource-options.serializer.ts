import { serializePaginationOptions } from '../../common/serializers';
import { ListMembershipsForResourceByExternalIdOptions } from '../interfaces/list-memberships-for-resource-by-external-id-options.interface';
import { ListMembershipsForResourceOptions } from '../interfaces/list-memberships-for-resource-options.interface';

type ListMembershipsQueryOptions =
  | ListMembershipsForResourceOptions
  | ListMembershipsForResourceByExternalIdOptions;

export const serializeListMembershipsForResourceOptions = (
  options: ListMembershipsQueryOptions,
): Record<string, string | number> => ({
  permission_slug: options.permissionSlug,
  ...(options.assignment && { assignment: options.assignment }),
  ...serializePaginationOptions(options),
});
