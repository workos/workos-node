import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface UpdateOrganizationOptions extends PaginationOptions {
  organization: string;
  name: string;
  domains?: string[];
}
