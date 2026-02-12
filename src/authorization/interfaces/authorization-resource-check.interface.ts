export interface AuthorizationCheckResult {
  authorized: boolean;
}

interface BaseAuthorizationCheckOptions {
  organizationMembershipId: string;
  permissionSlug: string;
}

interface ResourceId {
  resourceId: string;
}

interface ResourceExternalId {
  resourceExternalId: string;
  resourceTypeSlug: string;
}

export type AuthorizationCheckOptions =
  | (BaseAuthorizationCheckOptions & ResourceId)
  | (BaseAuthorizationCheckOptions & ResourceExternalId);

export interface SerializedAuthorizationCheckOptions {
  permission_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
