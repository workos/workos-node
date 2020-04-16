import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListDirectoriesOptions extends PaginationOptions {
  domain?: string;
  search?: string;
}
