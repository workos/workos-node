import {
  OrganizationMembership,
  OrganizationMembershipResponse,
} from '../../user-management/interfaces/organization-membership.interface';

export type FgaOrganizationMembership = Omit<
  OrganizationMembership,
  'role' | 'roles'
>;

export type FgaOrganizationMembershipResponse = Omit<
  OrganizationMembershipResponse,
  'role' | 'roles'
>;

export interface OrganizationMembershipList {
  object: 'list';
  data: FgaOrganizationMembership[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

export interface OrganizationMembershipListResponse {
  object: 'list';
  data: FgaOrganizationMembershipResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}
