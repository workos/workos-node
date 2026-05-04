import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListRoleAssignmentsForResourceByExternalIdOptions extends PaginationOptions {
  organizationId: string;
  resourceTypeSlug: string;
  externalId: string;
}
