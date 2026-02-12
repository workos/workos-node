export interface AuthorizationCheckResult {
  authorized: boolean;
}

// TODO given what is in authorization.controller.e2e we should split these two up
// this is for check, but useful in other places too
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
