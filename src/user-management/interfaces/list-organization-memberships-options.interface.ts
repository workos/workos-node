import { PaginationOptions } from '../../common/interfaces';
import { OrganizationMembershipStatus } from './organization-membership.interface';

export type ListOrganizationMembershipsOptions = PaginationOptions & {
  statuses?: OrganizationMembershipStatus[];
} & (
    | { organizationId: string; userId?: string }
    | { organizationId?: string; userId: string }
  );

export interface SerializedListOrganizationMembershipsOptions
  extends PaginationOptions {
  organization_id?: string;
  user_id?: string;
  statuses?: string;
}
