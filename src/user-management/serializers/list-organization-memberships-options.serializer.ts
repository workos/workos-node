import {
  ListOrganizationMembershipsOptions,
  SerializedListOrganizationMembershipsOptions,
} from '../interfaces/list-organization-memberships-options.interface';

export const serializeListOrganizationMembershipsOptions = (
  options: ListOrganizationMembershipsOptions,
): SerializedListOrganizationMembershipsOptions => ({
  user_id: options.userId,
  organization_id: options.organizationId,
  statuses: options.statuses?.join(','),
  limit: options.limit,
  before: options.before,
  after: options.after,
  order: options.order,
});
