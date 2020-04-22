import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListGroupsOptions extends PaginationOptions {
  directory?: string;
  user?: string;
}
