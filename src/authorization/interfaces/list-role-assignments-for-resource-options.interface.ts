import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListRoleAssignmentsForResourceOptions extends PaginationOptions {
  resourceId: string;
  /** Filter role assignments to only those that grant this role. */
  roleSlug?: string;
}

export interface SerializedListRoleAssignmentsForResourceOptions extends PaginationOptions {
  role_slug?: string;
}
