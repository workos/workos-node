import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

interface BaseListResourcesForMembershipOptions extends PaginationOptions {
  organizationMembershipId: string;
  permissionSlug: string;
}

export interface ListResourcesForMembershipOptionsWithParentId extends BaseListResourcesForMembershipOptions {
  parentResourceId: string;
}

export interface ListResourcesForMembershipOptionsWithParentExternalId extends BaseListResourcesForMembershipOptions {
  parentResourceTypeSlug: string;
  parentResourceExternalId: string;
}

export type ListResourcesForMembershipOptions =
  | ListResourcesForMembershipOptionsWithParentId
  | ListResourcesForMembershipOptionsWithParentExternalId;

export interface SerializedListResourcesForMembershipOptions extends PaginationOptions {
  permission_slug: string;
  parent_resource_id?: string;
  parent_resource_type_slug?: string;
  parent_resource_external_id?: string;
}
