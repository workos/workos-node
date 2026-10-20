import { RoleResponse } from '../../roles/interfaces/';
import { User, UserResponse } from './user.interface';

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
  /** The name of the organization which the user belongs to. */
  organizationName: string;
  /** The primary role assigned to the user within the organization. */
  role: RoleResponse;
  roles?: RoleResponse[];
  /**
   * The user who holds this membership. Returned by the Organization
   * Membership API endpoints; absent from event and action payloads.
   */
  user?: User;
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
  user?: UserResponse;
}

export type AuthorizationOrganizationMembershipResponse =
  BaseOrganizationMembershipResponse;
