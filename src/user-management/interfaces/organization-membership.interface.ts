import { RoleResponse } from '../../roles/interfaces/';

export type OrganizationMembershipStatus = 'active' | 'inactive' | 'pending';

export interface OrganizationMembership {
  object: 'organization_membership';
  id: string;
  organizationId: string;
  status: OrganizationMembershipStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  role: RoleResponse;
}

export interface OrganizationMembershipResponse {
  object: 'organization_membership';
  id: string;
  organization_id: string;
  status: OrganizationMembershipStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  role: RoleResponse;
}
