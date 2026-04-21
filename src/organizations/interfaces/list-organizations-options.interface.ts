import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListOrganizationsOptions extends PaginationOptions {
  /** The domains of an Organization. Any Organization with a matching domain will be returned. */
  domains?: string[];
}
