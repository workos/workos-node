import { PaginationOptions } from '../../common/interfaces';

export interface ListGroupMembersOptions extends PaginationOptions {
  organizationId: string;
  groupId: string;
}
