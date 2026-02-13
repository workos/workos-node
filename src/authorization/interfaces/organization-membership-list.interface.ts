import {
  BaseOrganizationMembership,
  BaseOrganizationMembershipResponse,
} from '../../user-management/interfaces/organization-membership.interface';

export interface AuthorizationOrganizationMembership extends BaseOrganizationMembership {
  organizationName?: string;
}

export interface AuthorizationOrganizationMembershipResponse extends BaseOrganizationMembershipResponse {
  organization_name?: string;
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
