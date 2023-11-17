import {
  ListInvitationsOptions,
  SerializedListInvitationsOptions,
} from '../interfaces/list-invitations-options.interface';

export const serializeListInvitationsOptions = (
  options: ListInvitationsOptions,
): SerializedListInvitationsOptions => ({
  email: options.email,
  organization_id: options.organizationId,
  limit: options.limit,
  before: options.before,
  after: options.after,
  order: options.order,
});
