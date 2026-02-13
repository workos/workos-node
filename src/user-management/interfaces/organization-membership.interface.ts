import { RoleResponse } from '../../roles/interfaces/';

export type OrganizationMembershipStatus = 'active' | 'inactive' | 'pending';

export interface BaseOrganizationMembership {
  object: 'organization_membership';
  id: string;
  organizationId: string;
  organizationName?: string;
  status: OrganizationMembershipStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  customAttributes: Record<string, unknown>;
}

export interface BaseOrganizationMembershipResponse {
  object: 'organization_membership';
  id: string;
  organization_id: string;
  organization_name?: string;
  status: OrganizationMembershipStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  custom_attributes: Record<string, unknown>;
}

export interface OrganizationMembership extends BaseOrganizationMembership {
  role?: RoleResponse;
  roles?: RoleResponse[];
}

export interface OrganizationMembershipResponse extends BaseOrganizationMembershipResponse {
  role?: RoleResponse;
  roles?: RoleResponse[];
}
