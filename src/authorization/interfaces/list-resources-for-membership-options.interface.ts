import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListResourcesForMembershipOptions extends PaginationOptions {
  organizationMembershipId: string;
  resourceTypeSlugs?: string[];
}

export interface SerializedListResourcesForMembershipOptions {
  resource_type_slugs?: string;
  limit?: number;
  after?: string;
  before?: string;
  order?: 'asc' | 'desc';
}
