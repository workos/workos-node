import { PaginationOptions } from 'src/common/interfaces/pagination-options.interface';

export interface ListMembershipsForResourceOptions extends PaginationOptions {
  resourceId: string;
  permissionSlug: string;
  assignment?: 'direct' | 'indirect';
}
