import {
  AuthorizationResourceIdentifierById,
  AuthorizationResourceIdentifierByExternalId,
} from './authorization-resource-identifier.interface';

export interface BaseRemoveGroupRoleAssignmentsOptions {
  groupId: string;
  roleSlug: string;
}

export type RemoveGroupRoleAssignmentsOptionsForOrganization =
  BaseRemoveGroupRoleAssignmentsOptions;

export interface RemoveGroupRoleAssignmentsOptionsWithResourceId
  extends
    BaseRemoveGroupRoleAssignmentsOptions,
    AuthorizationResourceIdentifierById {}

export interface RemoveGroupRoleAssignmentsOptionsWithResourceExternalId
  extends
    BaseRemoveGroupRoleAssignmentsOptions,
    AuthorizationResourceIdentifierByExternalId {}

/**
 * Omit the resource fields entirely to remove the role assignment on the
 * organization itself. Otherwise provide either `resourceId` or both
 * `resourceExternalId` and `resourceTypeSlug`.
 */
export type RemoveGroupRoleAssignmentsOptions =
  | RemoveGroupRoleAssignmentsOptionsForOrganization
  | RemoveGroupRoleAssignmentsOptionsWithResourceId
  | RemoveGroupRoleAssignmentsOptionsWithResourceExternalId;

export interface SerializedRemoveGroupRoleAssignmentsOptions {
  role_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
