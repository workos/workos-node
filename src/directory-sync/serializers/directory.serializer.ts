import { Directory, DirectoryResponse } from '../interfaces';

export const deserializeDirectory = (
  directory: DirectoryResponse,
): Directory => ({
  object: directory.object,
  id: directory.id,
  domain: directory.domain,
  externalKey: directory.external_key,
  name: directory.name,
  organizationId: directory.organization_id,
  state: directory.state,
  type: directory.type,
  createdAt: directory.created_at,
  updatedAt: directory.updated_at,
});
