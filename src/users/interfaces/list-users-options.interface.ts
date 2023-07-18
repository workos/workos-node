import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListUsersOptions extends PaginationOptions {
  type?: 'managed' | 'unmanaged';
  email?: string;
  organization?: string;
}
