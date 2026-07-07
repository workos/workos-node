import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListGroupRoleAssignmentsOptions extends PaginationOptions {
  /** The ID of the group. */
  groupId: string;
}
