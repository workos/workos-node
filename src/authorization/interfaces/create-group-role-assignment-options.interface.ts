import {
  AuthorizationResourceIdentifierById,
  AuthorizationResourceIdentifierByExternalId,
} from './authorization-resource-identifier.interface';

export interface BaseCreateGroupRoleAssignmentOptions {
  groupId: string;
  roleSlug: string;
}

export type CreateGroupRoleAssignmentOptionsForOrganization =
  BaseCreateGroupRoleAssignmentOptions;

export interface CreateGroupRoleAssignmentOptionsWithResourceId
  extends
    BaseCreateGroupRoleAssignmentOptions,
    AuthorizationResourceIdentifierById {}

export interface CreateGroupRoleAssignmentOptionsWithResourceExternalId
  extends
    BaseCreateGroupRoleAssignmentOptions,
    AuthorizationResourceIdentifierByExternalId {}

/**
 * Omit the resource fields entirely to assign the role on the organization
 * itself. Otherwise provide either `resourceId` or both `resourceExternalId`
 * and `resourceTypeSlug`.
 */
export type CreateGroupRoleAssignmentOptions =
  | CreateGroupRoleAssignmentOptionsForOrganization
  | CreateGroupRoleAssignmentOptionsWithResourceId
  | CreateGroupRoleAssignmentOptionsWithResourceExternalId;

export interface SerializedCreateGroupRoleAssignmentOptions {
  role_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
