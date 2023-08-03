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
