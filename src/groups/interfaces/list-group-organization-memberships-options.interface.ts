import { PaginationOptions } from '../../common/interfaces';

export interface ListGroupOrganizationMembershipsOptions extends PaginationOptions {
  organizationId: string;
  groupId: string;
}
