import {
  AuthorizationResourceIdentifierById,
  AuthorizationResourceIdentifierByExternalId,
} from './authorization-resource-identifier.interface';

export interface AuthorizationCheckResult {
  authorized: boolean;
}

interface BaseAuthorizationCheckOptions {
  organizationMembershipId: string;
  permissionSlug: string;
}

export interface AuthorizationCheckOptionsWithResourceId
  extends BaseAuthorizationCheckOptions,
  AuthorizationResourceIdentifierById {}

export interface AuthorizationCheckOptionsWithResourceExternalId
  extends BaseAuthorizationCheckOptions,
  AuthorizationResourceIdentifierByExternalId {}

export type AuthorizationCheckOptions =
  | AuthorizationCheckOptionsWithResourceId
  | AuthorizationCheckOptionsWithResourceExternalId;

export interface SerializedAuthorizationCheckOptions {
  permission_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
