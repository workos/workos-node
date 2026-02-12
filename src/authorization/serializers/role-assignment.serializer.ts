import {
  RoleAssignment,
  RoleAssignmentResponse,
} from '../interfaces/role-assignment.interface';

export const deserializeRoleAssignment = (
  response: RoleAssignmentResponse,
): RoleAssignment => ({
  object: response.object,
  id: response.id,
  role: response.role,
  resource: {
    id: response.resource.id,
    externalId: response.resource.external_id,
    resourceTypeSlug: response.resource.resource_type_slug,
  },
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});
