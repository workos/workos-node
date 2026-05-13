import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListRoleAssignmentsForResourceByExternalIdOptions extends PaginationOptions {
  organizationId: string;
  resourceTypeSlug: string;
  externalId: string;
  /** Filter role assignments to only those that grant this role. */
  roleSlug?: string;
}
