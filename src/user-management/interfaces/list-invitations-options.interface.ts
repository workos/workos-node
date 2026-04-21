import { PaginationOptions } from '../../common/interfaces';

export interface ListInvitationsOptions extends PaginationOptions {
  /** The ID of the [organization](https://workos.com/docs/reference/organization) that the recipient will join. */
  organizationId?: string;
  /** The email address of the recipient. */
  email?: string;
}

export interface SerializedListInvitationsOptions extends PaginationOptions {
  organization_id?: string;
  email?: string;
}
