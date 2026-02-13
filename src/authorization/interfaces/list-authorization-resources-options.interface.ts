import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListAuthorizationResourcesOptions extends PaginationOptions {
  organizationId?: string;
  resourceTypeSlug?: string;
  parentResourceId?: string;
  parentResourceTypeSlug?: string;
  parentExternalId?: string;
  search?: string;
}

export interface SerializedListAuthorizationResourcesOptions extends PaginationOptions {
  organization_id?: string;
  resource_type_slug?: string;
  parent_resource_id?: string;
  parent_resource_type_slug?: string;
  parent_external_id?: string;
  search?: string;
}
