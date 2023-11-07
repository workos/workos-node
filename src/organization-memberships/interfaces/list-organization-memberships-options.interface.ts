import { PaginationOptions } from '../../common/interfaces';

export interface ListOrganizationMembershipsOptions extends PaginationOptions {
  organization?: string;
  user?: string;
}
