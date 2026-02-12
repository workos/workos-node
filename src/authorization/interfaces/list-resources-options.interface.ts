export interface ListAuthorizationResourcesOptions {
  organizationIds?: string[];
  resourceTypeSlugs?: string[];
  parentResourceId?: string;
  parentResourceTypeSlug?: string;
  parentExternalId?: string;
  search?: string;
  limit?: number;
  after?: string;
  before?: string;
  order?: 'asc' | 'desc';
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

export interface AuthorizationResourceList {
  object: 'list';
  data: import('./authorization-resource.interface').AuthorizationResource[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

export interface AuthorizationResourceListResponse {
  object: 'list';
  data: import('./authorization-resource.interface').AuthorizationResourceResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}
