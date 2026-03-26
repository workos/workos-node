export interface CreatePermissionOptions {
  slug: string;
  name: string;
  description?: string;
  resourceTypeSlug?: string;
}

export interface SerializedCreatePermissionOptions {
  slug: string;
  name: string;
  description?: string;
  resource_type_slug?: string;
}
