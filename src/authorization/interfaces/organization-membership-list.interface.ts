import {
  OrganizationMembership,
  OrganizationMembershipResponse,
} from '../../user-management/interfaces/organization-membership.interface';

/**
 * Re-export for convenience within the authorization module
 */
export { OrganizationMembership, OrganizationMembershipResponse };

/**
 * Paginated list of organization memberships (SDK type)
 */
export interface OrganizationMembershipList {
  object: 'list';
  data: OrganizationMembership[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

/**
 * Paginated list of organization memberships (API response type)
 */
export interface OrganizationMembershipListResponse {
  object: 'list';
  data: OrganizationMembershipResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}
