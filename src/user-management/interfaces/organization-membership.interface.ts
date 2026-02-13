import { RoleResponse } from '../../roles/interfaces/';

export type OrganizationMembershipStatus = 'active' | 'inactive' | 'pending';

export interface BaseOrganizationMembership {
  object: 'organization_membership';
  id: string;
  organizationId: string;
  status: OrganizationMembershipStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  customAttributes: Record<string, unknown>;
}

export interface OrganizationMembership extends BaseOrganizationMembership {
  organizationName: string;
  role: RoleResponse;
  roles?: RoleResponse[];
}

export interface BaseOrganizationMembershipResponse {
  object: 'organization_membership';
  id: string;
  organization_id: string;
  status: OrganizationMembershipStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  custom_attributes?: Record<string, unknown>;
}

export interface OrganizationMembershipResponse extends BaseOrganizationMembershipResponse {
  organization_name: string;
  role: RoleResponse;
  roles?: RoleResponse[];
}
