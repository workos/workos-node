// @oagen-ignore-file
// Hand-owned: `deserializeDirectoryState` maps the raw wire states
// (`linked`/`unlinked`) back to this SDK's historical `active`/`inactive`
// values. The OpenAPI spec only describes the raw enum, so oagen can't generate
// this mapping — everything else in this serializer mirrors the generated
// output. Keep in lockstep with directory-state.interface.ts.
import type {
  Directory,
  DirectoryResponse,
} from '../interfaces/directory.interface';
import type { DirectoryState } from '../interfaces/directory-state.interface';
import { deserializeDirectoryMetadata } from './directory-metadata.serializer';

const deserializeDirectoryState = (state: string): DirectoryState => {
  if (state === 'linked') {
    return 'active';
  }

  if (state === 'unlinked') {
    return 'inactive';
  }

  return state as DirectoryState;
};

export const deserializeDirectory = (
  response: DirectoryResponse,
): Directory => ({
  object: response.object,
  id: response.id,
  organizationId: response.organization_id,
  externalKey: response.external_key,
  type: response.type,
  state: deserializeDirectoryState(response.state),
  name: response.name,
  domain: response.domain,
  metadata:
    response.metadata != null
      ? deserializeDirectoryMetadata(response.metadata)
      : undefined,
  createdAt: new Date(response.created_at),
  updatedAt: new Date(response.updated_at),
});
