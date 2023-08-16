import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListDirectoriesOptions extends PaginationOptions {
  domain?: string;
  organizationId?: string;
  search?: string;
}

export interface SerializedListDirectoriesOptions extends PaginationOptions {
  domain?: string;
  organization_id?: string;
  search?: string;
}
