import { OrganizationMembershipStatus } from '../../user-management/interfaces/organization-membership.interface';

export interface GroupMember {
  object: 'organization_membership';
  id: string;
  organizationId: string;
  userId: string;
  status: OrganizationMembershipStatus;
  directoryManaged: boolean;
  createdAt: string;
  updatedAt: string;
  customAttributes: Record<string, unknown>;
}

export interface GroupMemberResponse {
  object: 'organization_membership';
  id: string;
  organization_id: string;
  user_id: string;
  status: OrganizationMembershipStatus;
  directory_managed?: boolean;
  created_at: string;
  updated_at: string;
  custom_attributes?: Record<string, unknown>;
}
