export interface CreateEnvironmentRoleOptions {
  slug: string;
  name: string;
  description?: string;
  resourceTypeSlug?: string;
}

export interface SerializedCreateEnvironmentRoleOptions {
  slug: string;
  name: string;
  description?: string;
  resource_type_slug?: string;
}
