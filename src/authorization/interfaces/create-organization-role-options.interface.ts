export interface CreateOrganizationRoleOptions {
  slug?: string;
  name: string;
  description?: string;
  resourceTypeSlug?: string;
}

export interface SerializedCreateOrganizationRoleOptions {
  slug?: string;
  name: string;
  description?: string;
  resource_type_slug?: string;
}
