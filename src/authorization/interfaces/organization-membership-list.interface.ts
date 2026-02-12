import {
  OrganizationMembership,
  OrganizationMembershipResponse,
} from '../../user-management/interfaces/organization-membership.interface';

export interface OrganizationMembershipList {
  object: 'list';
  data: OrganizationMembership[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

export interface OrganizationMembershipListResponse {
  object: 'list';
  data: OrganizationMembershipResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}

export interface AuthorizationOrganizationMembership {
  object: 'organization_membership';
  id: string;
  organizationId: string;
  organizationName?: string;
  status: 'active' | 'inactive' | 'pending';
  userId: string;
  createdAt: string;
  updatedAt: string;
  customAttributes: Record<string, unknown>;
}

export interface AuthorizationOrganizationMembershipResponse {
  object: 'organization_membership';
  id: string;
  organization_id: string;
  organization_name?: string;
  status: 'active' | 'inactive' | 'pending';
  user_id: string;
  created_at: string;
  updated_at: string;
  custom_attributes: Record<string, unknown>;
}

export interface AuthorizationOrganizationMembershipList {
  object: 'list';
  data: AuthorizationOrganizationMembership[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

export interface AuthorizationOrganizationMembershipListResponse {
  object: 'list';
  data: AuthorizationOrganizationMembershipResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}
