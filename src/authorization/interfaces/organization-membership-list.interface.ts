import {
  OrganizationMembership,
  OrganizationMembershipResponse,
} from '../../user-management/interfaces/organization-membership.interface';

export { OrganizationMembership, OrganizationMembershipResponse };

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
