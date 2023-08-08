import {
  DirectoryUser,
  DirectoryUserResponse,
} from '../../directory-sync/interfaces';

export const deserializeUpdatedWebhookDirectoryUser = (
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
  emails: directoryUser.emails,
  username: directoryUser.username,
  lastName: directoryUser.last_name,
  jobTitle: directoryUser.job_title,
  state: directoryUser.state,
  createdAt: directoryUser.created_at,
  updatedAt: directoryUser.updated_at,
  previousAttributes: directoryUser.previous_attributes,
});
