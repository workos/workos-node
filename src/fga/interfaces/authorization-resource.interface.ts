export interface AuthorizationResource {
  object: 'authorization_resource';
  id: string;
  externalId: string;
  name: string;
  description: string | null;
  resourceType: string;
  organizationId: string;
  parentResourceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorizationResourceResponse {
  object: 'authorization_resource';
  id: string;
  external_id: string;
  name: string;
  description: string | null;
  resource_type: string;
  organization_id: string;
  parent_resource_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthorizationResourceList {
  object: 'list';
  data: AuthorizationResource[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

export interface AuthorizationResourceListResponse {
  object: 'list';
  data: AuthorizationResourceResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}
