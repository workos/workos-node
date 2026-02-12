export interface RemoveRoleOptions {
  organizationMembershipId: string;
  roleSlug: string;
  resourceId?: string;
  resourceExternalId?: string;
  resourceTypeSlug?: string;
}

export interface SerializedRemoveRoleOptions {
  role_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
