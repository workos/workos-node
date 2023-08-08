import { Connection, ConnectionResponse } from '../interfaces';

export const deserializeConnection = (
  connection: ConnectionResponse,
): Connection => ({
  object: connection.object,
  id: connection.id,
  organizationId: connection.organization_id,
  name: connection.name,
  connectionType: connection.connection_type,
  type: connection.connection_type,
  state: connection.state,
  domains: connection.domains,
  createdAt: connection.created_at,
  updatedAt: connection.updated_at,
});
