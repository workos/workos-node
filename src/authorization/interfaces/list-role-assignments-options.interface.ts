import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListRoleAssignmentsOptions extends PaginationOptions {
  organizationMembershipId: string;
  /** Filter role assignments to only those granted on the resource with this ID. */
  resourceId?: string;
  /** Filter role assignments to only those granted on the resource with this external ID. Can be used on its own or combined with `resourceTypeSlug`. */
  resourceExternalId?: string;
  /** Filter role assignments to only those granted on resources of this type. Can be used on its own or combined with `resourceExternalId`. */
  resourceTypeSlug?: string;
}

export interface SerializedListRoleAssignmentsOptions extends PaginationOptions {
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
