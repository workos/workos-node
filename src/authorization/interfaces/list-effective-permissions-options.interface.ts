import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListEffectivePermissionsOptions extends PaginationOptions {
  organizationMembershipId: string;
  resourceId: string;
}
