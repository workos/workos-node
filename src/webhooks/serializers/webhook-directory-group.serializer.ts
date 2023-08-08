import {
  WebhookDirectoryGroup,
  WebhookDirectoryGroupResponse,
} from '../interfaces';

export const deserializeWebhookDirectoryGroup = (
  directoryGroup: WebhookDirectoryGroupResponse,
): WebhookDirectoryGroup => ({
  id: directoryGroup.id,
  idpId: directoryGroup.idp_id,
  directoryId: directoryGroup.directory_id,
  organizationId: directoryGroup.organization_id,
  name: directoryGroup.name,
  createdAt: directoryGroup.created_at,
  updatedAt: directoryGroup.updated_at,
  rawAttributes: directoryGroup.raw_attributes,
});

export const deserializeUpdatedWebhookDirectoryGroup = (
  directoryGroup: WebhookDirectoryGroupResponse &
    Record<'previous_attributes', any>,
): WebhookDirectoryGroup & Record<'previousAttributes', any> => ({
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
