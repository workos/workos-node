import { RoleResponse } from '../../roles/interfaces/';

export type OrganizationMembershipStatus = 'active' | 'inactive' | 'pending';

export interface OrganizationMembership<TRole extends string = string> {
  object: 'organization_membership';
  id: string;
  organizationId: string;
  status: OrganizationMembershipStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  role: RoleResponse<TRole>;
}

export interface OrganizationMembershipResponse<TRole extends string = string> {
  object: 'organization_membership';
  id: string;
  organization_id: string;
  status: OrganizationMembershipStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  role: RoleResponse<TRole>;
}
