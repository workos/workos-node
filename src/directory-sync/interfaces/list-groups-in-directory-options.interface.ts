import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListGroupsInDirectoryOptions extends PaginationOptions {
  /** Unique identifier of the Directory. */
  directoryId: string;
  /** Filter Directory Groups to those this Directory User belongs to. */
  user?: string;
}
