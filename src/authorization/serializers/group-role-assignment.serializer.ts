import {
  GroupRoleAssignment,
  GroupRoleAssignmentResponse,
} from '../interfaces/group-role-assignment.interface';

export const deserializeGroupRoleAssignment = (
  response: GroupRoleAssignmentResponse,
): GroupRoleAssignment => ({
  object: response.object,
  id: response.id,
  groupId: response.group_id,
  role: response.role,
  resource: {
    id: response.resource.id,
    externalId: response.resource.external_id,
    resourceTypeSlug: response.resource.resource_type_slug,
  },
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});
