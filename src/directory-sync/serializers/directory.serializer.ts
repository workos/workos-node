import {
  Directory,
  DirectoryResponse,
  DirectoryState,
  DirectoryStateResponse,
  EventDirectory,
  EventDirectoryResponse,
} from '../interfaces';

export const deserializeDirectory = (
  directory: DirectoryResponse,
): Directory => ({
  object: directory.object,
  id: directory.id,
  domain: directory.domain,
  externalKey: directory.external_key,
  name: directory.name,
  organizationId: directory.organization_id,
  state: deserializeDirectoryState(directory.state),
  type: directory.type,
  createdAt: directory.created_at,
  updatedAt: directory.updated_at,
});

export const deserializeDirectoryState = (
  state: DirectoryStateResponse,
): DirectoryState => {
  if (state === 'linked') {
    return 'active';
  }

  if (state === 'unlinked') {
    return 'inactive';
  }

  return state;
};

export const deserializeEventDirectory = (
  directory: EventDirectoryResponse,
): EventDirectory => ({
  object: directory.object,
  id: directory.id,
  externalKey: directory.external_key,
  type: directory.type,
  state: directory.state,
  name: directory.name,
  organizationId: directory.organization_id,
  domains: directory.domains,
  createdAt: directory.created_at,
  updatedAt: directory.updated_at,
});

export const deserializeDeletedEventDirectory = (
  directory: Omit<EventDirectoryResponse, 'domains' | 'external_key'>,
): Omit<EventDirectory, 'domains' | 'externalKey'> => ({
  object: directory.object,
  id: directory.id,
  type: directory.type,
  state: directory.state,
  name: directory.name,
  organizationId: directory.organization_id,
  createdAt: directory.created_at,
  updatedAt: directory.updated_at,
});
