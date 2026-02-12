import {
  AuthorizationResourceIdentifierById,
  AuthorizationResourceIdentifierByExternalId,
} from './authorization-resource-identifier.interface';

export interface BaseRemoveRoleOptions {
  organizationMembershipId: string;
  roleSlug: string;
}

export interface RemoveRoleOptionsWithResourceId
  extends BaseRemoveRoleOptions, AuthorizationResourceIdentifierById {}

export interface RemoveRoleOptionsWithResourceExternalId
  extends BaseRemoveRoleOptions, AuthorizationResourceIdentifierByExternalId {}

export type RemoveRoleOptions =
  | RemoveRoleOptionsWithResourceId
  | RemoveRoleOptionsWithResourceExternalId;

export interface SerializedRemoveRoleOptions {
  role_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
