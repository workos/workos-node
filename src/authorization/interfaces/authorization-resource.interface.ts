export interface AuthorizationResource {
  /** Distinguishes the Resource object. */
  object: 'authorization_resource';
  /** The unique ID of the Resource. */
  id: string;
  /** An identifier you provide to reference the resource in your system. */
  externalId: string;
  /** A human-readable name for the Resource. */
  name: string;
  /** An optional description of the Resource. */
  description: string | null;
  /** The slug of the resource type this resource belongs to. */
  resourceTypeSlug: string;
  /** The ID of the organization that owns the resource. */
  organizationId: string;
  /** The ID of the parent resource, if this resource is nested. */
  parentResourceId: string | null;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
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

interface BaseCreateAuthorizationResourceOptions {
  externalId: string;
  name: string;
  description?: string | null;
  resourceTypeSlug: string;
  organizationId: string;
}

export interface CreateOptionsWithParentResourceId extends BaseCreateAuthorizationResourceOptions {
  parentResourceId: string;
}

export interface CreateOptionsWithParentExternalId extends BaseCreateAuthorizationResourceOptions {
  parentResourceExternalId: string;
  parentResourceTypeSlug: string;
}

export type CreateAuthorizationResourceOptions =
  | BaseCreateAuthorizationResourceOptions
  | CreateOptionsWithParentResourceId
  | CreateOptionsWithParentExternalId;

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
