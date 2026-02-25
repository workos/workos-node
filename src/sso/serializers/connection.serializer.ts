import { Connection, ConnectionResponse } from '../interfaces';

export const deserializeConnection = (
  connection: ConnectionResponse,
): Connection => ({
  object: connection.object,
  id: connection.id,
  ...(connection.organization_id !== undefined && {
    organizationId: connection.organization_id,
  }),
  name: connection.name,
  type: connection.connection_type,
  state: connection.state,
  domains: connection.domains,
  createdAt: connection.created_at,
  updatedAt: connection.updated_at,
});
