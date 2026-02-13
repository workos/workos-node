import {
  AuthorizationResourceIdentifierById,
  AuthorizationResourceIdentifierByExternalId,
} from './authorization-resource-identifier.interface';

export interface BaseAssignRoleOptions {
  organizationMembershipId: string;
  roleSlug: string;
}

export interface AssignRoleOptionsWithResourceId
  extends BaseAssignRoleOptions, AuthorizationResourceIdentifierById {}

export interface AssignRoleOptionsWithResourceExternalId
  extends BaseAssignRoleOptions, AuthorizationResourceIdentifierByExternalId {}

export type AssignRoleOptions =
  | AssignRoleOptionsWithResourceId
  | AssignRoleOptionsWithResourceExternalId;

export interface SerializedAssignRoleOptions {
  role_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
