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
  TRawAttributes = any,
  TRole extends string = string,
>(
  directoryUser:
    | DirectoryUserResponse<TCustomAttributes, TRawAttributes, TRole>
    | DirectoryUserWithGroupsResponse<TCustomAttributes, TRawAttributes, TRole>,
): DirectoryUser<TCustomAttributes, TRawAttributes, TRole> => ({
  object: directoryUser.object,
  id: directoryUser.id,
  directoryId: directoryUser.directory_id,
  organizationId: directoryUser.organization_id,
  rawAttributes: directoryUser.raw_attributes,
  customAttributes: directoryUser.custom_attributes,
  idpId: directoryUser.idp_id,
  firstName: directoryUser.first_name,
  emails: directoryUser.emails,
  username: directoryUser.username,
  lastName: directoryUser.last_name,
  jobTitle: directoryUser.job_title,
  state: directoryUser.state,
  role: directoryUser.role,
  createdAt: directoryUser.created_at,
  updatedAt: directoryUser.updated_at,
});

export const deserializeDirectoryUserWithGroups = <
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any,
  TRole extends string = string,
>(
  directoryUserWithGroups: DirectoryUserWithGroupsResponse<TCustomAttributes, TRawAttributes, TRole>,
): DirectoryUserWithGroups<TCustomAttributes, TRawAttributes, TRole> => ({
  ...deserializeDirectoryUser(directoryUserWithGroups),
  groups: directoryUserWithGroups.groups.map(deserializeDirectoryGroup),
});

export const deserializeUpdatedEventDirectoryUser = <
  TCustomAttributes extends object = DefaultCustomAttributes,
  TRawAttributes = any,
  TRole extends string = string,
>(
  directoryUser: DirectoryUserResponse<TCustomAttributes, TRawAttributes, TRole> &
    Record<'previous_attributes', any>,
): DirectoryUser<TCustomAttributes, TRawAttributes, TRole> & Record<'previousAttributes', any> => ({
  object: 'directory_user',
  id: directoryUser.id,
  directoryId: directoryUser.directory_id,
  organizationId: directoryUser.organization_id,
  rawAttributes: directoryUser.raw_attributes,
  customAttributes: directoryUser.custom_attributes,
  idpId: directoryUser.idp_id,
  firstName: directoryUser.first_name,
  emails: directoryUser.emails,
  username: directoryUser.username,
  lastName: directoryUser.last_name,
  jobTitle: directoryUser.job_title,
  state: directoryUser.state,
  role: directoryUser.role,
  createdAt: directoryUser.created_at,
  updatedAt: directoryUser.updated_at,
  previousAttributes: directoryUser.previous_attributes,
});
