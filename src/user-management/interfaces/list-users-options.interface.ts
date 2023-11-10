import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListUsersOptions extends PaginationOptions {
  email?: string;
  organization?: string;
}
