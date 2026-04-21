import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListUsersOptions extends PaginationOptions {
  /** Filter users by their email address. */
  email?: string;
  /** Filter users by the organization they are a member of. */
  organizationId?: string;
}

export interface SerializedListUsersOptions extends PaginationOptions {
  email?: string;
  organization_id?: string;
}
