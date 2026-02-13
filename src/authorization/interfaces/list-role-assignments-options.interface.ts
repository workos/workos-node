import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
export interface ListRoleAssignmentsOptions extends PaginationOptions {
  organizationMembershipId: string;
}
