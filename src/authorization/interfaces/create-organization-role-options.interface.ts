export interface CreateOrganizationRoleOptions {
  organizationId: string;
  slug: string;
  name: string;
  description?: string;
}

export interface SerializedCreateOrganizationRoleOptions {
  slug: string;
  name: string;
  description?: string;
}
