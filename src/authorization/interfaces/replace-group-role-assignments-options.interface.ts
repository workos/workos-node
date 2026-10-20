import {
  AuthorizationResourceIdentifierById,
  AuthorizationResourceIdentifierByExternalId,
} from './authorization-resource-identifier.interface';

export interface BaseGroupRoleAssignmentEntry {
  roleSlug: string;
}

export type GroupRoleAssignmentEntryForOrganization =
  BaseGroupRoleAssignmentEntry;

export interface GroupRoleAssignmentEntryWithResourceId
  extends BaseGroupRoleAssignmentEntry, AuthorizationResourceIdentifierById {}

export interface GroupRoleAssignmentEntryWithResourceExternalId
  extends
    BaseGroupRoleAssignmentEntry,
    AuthorizationResourceIdentifierByExternalId {}

/**
 * Omit the resource fields entirely to assign the role on the organization
 * itself. Otherwise provide either `resourceId` or both `resourceExternalId`
 * and `resourceTypeSlug`.
 */
export type GroupRoleAssignmentEntry =
  | GroupRoleAssignmentEntryForOrganization
  | GroupRoleAssignmentEntryWithResourceId
  | GroupRoleAssignmentEntryWithResourceExternalId;

export interface ReplaceGroupRoleAssignmentsOptions {
  groupId: string;
  /**
   * The complete list of role assignments that should exist for the group.
   * Existing assignments absent from this list are removed; pass an empty
   * array to clear all assignments. At most 100 entries.
   */
  roleAssignments: GroupRoleAssignmentEntry[];
}

export interface SerializedGroupRoleAssignmentEntry {
  role_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}

export interface SerializedReplaceGroupRoleAssignmentsOptions {
  role_assignments: SerializedGroupRoleAssignmentEntry[];
}
