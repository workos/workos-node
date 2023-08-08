import {
  DirectoryGroup,
  DirectoryGroupResponse,
  EventDirectoryGroup,
  EventDirectoryGroupResponse,
} from '../interfaces';

export const deserializeDirectoryGroup = (
  directoryGroup: DirectoryGroupResponse,
): DirectoryGroup => ({
  id: directoryGroup.id,
  idpId: directoryGroup.idp_id,
  directoryId: directoryGroup.directory_id,
  organizationId: directoryGroup.organization_id,
  name: directoryGroup.name,
  createdAt: directoryGroup.created_at,
  updatedAt: directoryGroup.updated_at,
  rawAttributes: directoryGroup.raw_attributes,
});

export const deserializeEventDirectoryGroup = (
  directoryGroup: EventDirectoryGroupResponse,
): EventDirectoryGroup => ({
  id: directoryGroup.id,
  idpId: directoryGroup.idp_id,
  directoryId: directoryGroup.directory_id,
  organizationId: directoryGroup.organization_id,
  name: directoryGroup.name,
  createdAt: directoryGroup.created_at,
  updatedAt: directoryGroup.updated_at,
  rawAttributes: directoryGroup.raw_attributes,
});

export const deserializeUpdatedEventDirectoryGroup = (
  directoryGroup: EventDirectoryGroupResponse &
    Record<'previous_attributes', any>,
): EventDirectoryGroup & Record<'previousAttributes', any> => ({
  id: directoryGroup.id,
  idpId: directoryGroup.idp_id,
  directoryId: directoryGroup.directory_id,
  organizationId: directoryGroup.organization_id,
  name: directoryGroup.name,
  createdAt: directoryGroup.created_at,
  updatedAt: directoryGroup.updated_at,
  rawAttributes: directoryGroup.raw_attributes,
  previousAttributes: directoryGroup.previous_attributes,
});
