import { RoleResponse } from '../../roles/interfaces/';

export type OrganizationMembershipStatus = 'active' | 'inactive' | 'pending';

export interface BaseOrganizationMembership {
  object: 'organization_membership';
  id: string;
  organizationId: string;
  status: OrganizationMembershipStatus;
  userId: string;
  directoryManaged: boolean;
  createdAt: string;
  updatedAt: string;
  customAttributes: Record<string, unknown>;
}

export interface OrganizationMembership extends BaseOrganizationMembership {
  organizationName: string;
  role: RoleResponse;
  roles?: RoleResponse[];
}

export type AuthorizationOrganizationMembership = BaseOrganizationMembership;

export interface BaseOrganizationMembershipResponse {
  object: 'organization_membership';
  id: string;
  organization_id: string;
  organization_name: string;
  status: OrganizationMembershipStatus;
  user_id: string;
  directory_managed?: boolean;
  created_at: string;
  updated_at: string;
  custom_attributes?: Record<string, unknown>;
}

export interface OrganizationMembershipResponse extends BaseOrganizationMembershipResponse {
  role: RoleResponse;
  roles?: RoleResponse[];
}

export type AuthorizationOrganizationMembershipResponse =
  BaseOrganizationMembershipResponse;
  