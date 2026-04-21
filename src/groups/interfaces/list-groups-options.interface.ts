import { PaginationOptions } from '../../common/interfaces';

export interface ListGroupsOptions extends PaginationOptions {
  organizationId: string;
}
