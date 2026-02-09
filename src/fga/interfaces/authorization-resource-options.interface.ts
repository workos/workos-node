export interface CreateAuthorizationResourceOptions {
  organizationId: string;
  resourceTypeSlug: string;
  externalId: string;
  name: string;
  description?: string;
  parentResourceId?: string;
}

export interface SerializedCreateAuthorizationResourceOptions {
  organization_id: string;
  resource_type_slug: string;
  external_id: string;
  name: string;
  description?: string;
  parent_resource_id?: string;
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
