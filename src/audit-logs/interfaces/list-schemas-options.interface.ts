import { PaginationOptions } from '../../common/interfaces';

/**
 * Options for listing audit log schemas for a specific action.
 */
export interface ListSchemasOptions extends PaginationOptions {
  /** The action identifier (e.g., 'user.logged_in') */
  action: string;
}
