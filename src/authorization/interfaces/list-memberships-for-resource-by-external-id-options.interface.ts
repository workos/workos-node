import { PaginationOptions } from 'src/common/interfaces/pagination-options.interface';

export interface ListMembershipsForResourceByExternalIdOptions extends PaginationOptions {
  organizationId: string;
  resourceTypeSlug: string;
  externalId: string;
}
