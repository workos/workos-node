import {
  DirectoryGroup,
  DirectoryGroupResponse,
  EventDirectory,
  EventDirectoryResponse,
} from '../interfaces';
import { deserializeDirectoryGroup } from './directory-group.serializer';

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

export const deserializeUpdatedEventDirectoryGroup = (
  directoryGroup: DirectoryGroupResponse & Record<'previous_attributes', any>,
): DirectoryGroup & Record<'previousAttributes', any> => ({
  ...deserializeDirectoryGroup(directoryGroup),
  previousAttributes: directoryGroup.previous_attributes,
});
