import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListMembershipsForResourceByExternalIdOptions extends PaginationOptions {
  organizationId: string;
  resourceTypeSlug: string;
  externalId: string;
  permissionSlug: string;
  assignment?: 'direct' | 'indirect';
}
