import { WebhookDirectory, WebhookDirectoryResponse } from '../interfaces';

export const deserializeWebhookDirectory = (
  directory: WebhookDirectoryResponse,
): WebhookDirectory => ({
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

export const deserializeDeletedWebhookDirectory = (
  directory: Omit<WebhookDirectoryResponse, 'domains' | 'external_key'>,
): Omit<WebhookDirectory, 'domains' | 'externalKey'> => ({
  object: directory.object,
  id: directory.id,
  type: directory.type,
  state: directory.state,
  name: directory.name,
  organizationId: directory.organization_id,
  createdAt: directory.created_at,
  updatedAt: directory.updated_at,
});
