import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListRoleAssignmentsForResourceOptions extends PaginationOptions {
  resourceId: string;
}
