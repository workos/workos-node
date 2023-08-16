import {
  ListConnectionsOptions,
  SerializedListConnectionsOptions,
} from '../interfaces';

export const serializeListConnectionsOptions = (
  options: ListConnectionsOptions,
): SerializedListConnectionsOptions => ({
  connection_type: options.connectionType,
  domain: options.domain,
  organization_id: options.organizationId,
  limit: options.limit,
  before: options.before,
  after: options.after,
  order: options.order,
});
