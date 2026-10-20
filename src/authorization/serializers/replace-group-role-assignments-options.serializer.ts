import {
  GroupRoleAssignmentEntry,
  ReplaceGroupRoleAssignmentsOptions,
  SerializedGroupRoleAssignmentEntry,
  SerializedReplaceGroupRoleAssignmentsOptions,
} from '../interfaces/replace-group-role-assignments-options.interface';

const serializeEntry = (
  entry: GroupRoleAssignmentEntry,
): SerializedGroupRoleAssignmentEntry => ({
  role_slug: entry.roleSlug,
  ...('resourceId' in entry && { resource_id: entry.resourceId }),
  ...('resourceExternalId' in entry && {
    resource_external_id: entry.resourceExternalId,
    resource_type_slug: entry.resourceTypeSlug,
  }),
});

export const serializeReplaceGroupRoleAssignmentsOptions = (
  options: ReplaceGroupRoleAssignmentsOptions,
): SerializedReplaceGroupRoleAssignmentsOptions => ({
  role_assignments: options.roleAssignments.map(serializeEntry),
});
