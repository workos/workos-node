import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListOrganizationsOptions extends PaginationOptions {
  domain?: string;
}
