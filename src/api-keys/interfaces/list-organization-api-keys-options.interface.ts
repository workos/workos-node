import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListOrganizationApiKeysOptions extends PaginationOptions {
  organizationId: string;
}
