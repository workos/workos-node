export interface AuthorizationCheckOptions {
  organizationMembershipId: string;
  permissionSlug: string;
  resourceId?: string;
  resourceExternalId?: string;
  resourceTypeSlug?: string;
}

export interface SerializedAuthorizationCheckOptions {
  permission_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
