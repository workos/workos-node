import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListEffectivePermissionsByExternalIdOptions extends PaginationOptions {
  organizationMembershipId: string;
  organizationId: string;
  resourceTypeSlug: string;
  externalId: string;
}
