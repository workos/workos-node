export interface AuthorizationResource {
  object: 'authorization_resource';
  id: string;
  externalId: string;
  name: string;
  description: string | null;
  resourceTypeSlug: string;
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
  resource_type_slug: string;
  organization_id: string;
  parent_resource_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAuthorizationResourceOptions {
  externalId: string;
  name: string;
  description?: string | null;
  resourceTypeSlug: string;
  organizationId: string;
  parentResourceId?: string | null;
  parentResourceExternalId?: string | null;
  parentResourceTypeSlug?: string | null;
}

export interface SerializedCreateAuthorizationResourceOptions {
  external_id: string;
  name: string;
  description?: string | null;
  resource_type_slug: string;
  organization_id: string;
  parent_resource_id?: string | null;
  parent_resource_external_id?: string | null;
  parent_resource_type_slug?: string | null;
}

export interface UpdateAuthorizationResourceOptions {
  resourceId: string;
  name?: string;
  description?: string | null;
}

export interface SerializedUpdateAuthorizationResourceOptions {
  name?: string;
  description?: string | null;
}
