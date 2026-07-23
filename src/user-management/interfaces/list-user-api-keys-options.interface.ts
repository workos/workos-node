import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListUserApiKeysOptions extends PaginationOptions {
  organizationId?: string;
}

export interface SerializedListUserApiKeysOptions extends PaginationOptions {
  organization_id?: string;
}
