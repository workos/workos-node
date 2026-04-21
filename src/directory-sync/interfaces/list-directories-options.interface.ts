import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListDirectoriesOptions extends PaginationOptions {
  /** Filter Directories by their associated organization. */
  organizationId?: string;
  /** Searchable text to match against Directory names. */
  search?: string;
}

export interface SerializedListDirectoriesOptions extends PaginationOptions {
  organization_id?: string;
  search?: string;
}
