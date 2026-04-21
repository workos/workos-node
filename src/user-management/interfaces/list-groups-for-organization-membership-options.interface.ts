import { PaginationOptions } from '../../common/interfaces';

export interface ListGroupsForOrganizationMembershipOptions extends PaginationOptions {
  organizationMembershipId: string;
}
