import { PaginationOptions } from '../../common/interfaces';

export interface ListOrganizationMembershipsOptions extends PaginationOptions {
  organizationId?: string;
  userId?: string;
}
