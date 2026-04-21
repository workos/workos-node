import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListMembershipsForResourceOptions extends PaginationOptions {
  resourceId: string;
  /** The permission slug to filter by. Only users with this permission on the resource are returned. */
  permissionSlug: string;
  /** Filter by assignment type. Use `direct` for direct assignments only, or `indirect` to include inherited assignments. */
  assignment?: 'direct' | 'indirect';
}
