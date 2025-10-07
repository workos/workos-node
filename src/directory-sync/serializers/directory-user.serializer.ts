import {
  DefaultCustomAttributes,
  DirectoryUser,
  DirectoryUserResponse,
  DirectoryUserWithGroups,
  DirectoryUserWithGroupsResponse,
} from '../interfaces';
import { deserializeDirectoryGroup } from './directory-group.serializer';

export const deserializeDirectoryUser = <
  TCustomAttributes extends object = DefaultCustomAttributes,
>(
  directoryUser:
    | DirectoryUserResponse<TCustomAttributes>
    | DirectoryUserWithGroupsResponse<TCustomAttributes>,
): DirectoryUser<TCustomAttributes> => ({
  object: directoryUser.object,
  id: directoryUser.id,
  directoryId: directoryUser.directory_id,
  organizationId: directoryUser.organization_id,
  rawAttributes: directoryUser.raw_attributes,
  customAttributes: directoryUser.custom_attributes,
  idpId: directoryUser.idp_id,
  firstName: directoryUser.first_name,
  email: directoryUser.email,
  lastName: directoryUser.last_name,
  state: directoryUser.state,
  role: directoryUser.role,
  roles: directoryUser.roles,
  createdAt: directoryUser.created_at,
  updatedAt: directoryUser.updated_at,
});

export const deserializeDirectoryUserWithGroups = <
  TCustomAttributes extends object = DefaultCustomAttributes,
>(
  directoryUserWithGroups: DirectoryUserWithGroupsResponse<TCustomAttributes>,
): DirectoryUserWithGroups<TCustomAttributes> => ({
  ...deserializeDirectoryUser(directoryUserWithGroups),
  groups: directoryUserWithGroups.groups.map(deserializeDirectoryGroup),
});

export const deserializeUpdatedEventDirectoryUser = (
  directoryUser: DirectoryUserResponse & Record<'previous_attributes', any>,
): DirectoryUser & Record<'previousAttributes', any> => ({
  object: 'directory_user',
  id: directoryUser.id,
  directoryId: directoryUser.directory_id,
  organizationId: directoryUser.organization_id,
  rawAttributes: directoryUser.raw_attributes,
  customAttributes: directoryUser.custom_attributes,
  idpId: directoryUser.idp_id,
  firstName: directoryUser.first_name,
  email: directoryUser.email,
  lastName: directoryUser.last_name,
  state: directoryUser.state,
  role: directoryUser.role,
  roles: directoryUser.roles,
  createdAt: directoryUser.created_at,
  updatedAt: directoryUser.updated_at,
  previousAttributes: directoryUser.previous_attributes,
});
