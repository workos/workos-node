import {
  BaseOrganizationMembership,
  BaseOrganizationMembershipResponse,
} from '../../user-management/interfaces/organization-membership.interface';

export interface OrganizationMembershipList {
  object: 'list';
  data: BaseOrganizationMembership[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

export interface OrganizationMembershipListResponse {
  object: 'list';
  data: BaseOrganizationMembershipResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}
