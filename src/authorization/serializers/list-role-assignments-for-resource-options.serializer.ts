import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
import { serializePaginationOptions } from '../../common/serializers';
import { SerializedListRoleAssignmentsForResourceOptions } from '../interfaces/list-role-assignments-for-resource-options.interface';

interface ListRoleAssignmentsForResourceQueryOptions extends PaginationOptions {
  roleSlug?: string;
}

export const serializeListRoleAssignmentsForResourceOptions = (
  options: ListRoleAssignmentsForResourceQueryOptions,
): SerializedListRoleAssignmentsForResourceOptions => ({
  ...(options.roleSlug && { role_slug: options.roleSlug }),
  ...serializePaginationOptions(options),
});
