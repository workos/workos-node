import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListAuthorizationResourcesOptions extends PaginationOptions {
  organizationIds?: string[];
  resourceTypeSlugs?: string[];
  parentResourceId?: string;
  parentResourceTypeSlug?: string;
  parentExternalId?: string;
  search?: string;
}

export interface SerializedListAuthorizationResourcesOptions {
  organization_ids?: string;
  resource_type_slugs?: string;
  parent_resource_id?: string;
  parent_resource_type_slug?: string;
  parent_external_id?: string;
  search?: string;
  limit?: number;
  after?: string;
  before?: string;
  order?: 'asc' | 'desc';
}
