import {
  RoleAssignmentRole,
  RoleAssignmentResource,
  RoleAssignmentResourceResponse,
} from './role-assignment.interface';

export interface GroupRoleAssignment {
  /** Distinguishes the group role assignment object. */
  object: 'group_role_assignment';
  /** Unique identifier of the group role assignment. */
  id: string;
  /** The ID of the group the role is assigned to. */
  groupId: string;
  /** The role included in the assignment. */
  role: RoleAssignmentRole;
  /** The resource the role is assigned on. */
  resource: RoleAssignmentResource;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface GroupRoleAssignmentResponse {
  object: 'group_role_assignment';
  id: string;
  group_id: string;
  role: RoleAssignmentRole;
  resource: RoleAssignmentResourceResponse;
  created_at: string;
  updated_at: string;
}
