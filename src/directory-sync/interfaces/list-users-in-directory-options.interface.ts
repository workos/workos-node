import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListUsersInDirectoryOptions extends PaginationOptions {
  /** Unique identifier of the Directory. */
  directoryId: string;
  /** Filter Directory Users to the members of this Directory Group. */
  group?: string;
  /** Filter Directory Users by the identity provider's unique identifier (`idp_id`). */
  idpId?: string;
  /** Filter Directory Users by their primary email address. */
  email?: string;
}
