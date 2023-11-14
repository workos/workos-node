import { PaginationOptions } from '../../common/interfaces';

export interface ListOrganizationMembershipsOptions extends PaginationOptions {
  organizationId?: string;
  userId?: string;
}

export interface SerializedListOrganizationMembershipsOptions
  extends PaginationOptions {
  organization_id?: string;
  user_id?: string;
}
