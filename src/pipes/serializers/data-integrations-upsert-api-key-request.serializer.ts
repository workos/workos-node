// @oagen-ignore-file
// Keep snake_case serialization for the legacy flat options and exact selectors.

import type {
  DataIntegrationsUpsertApiKeyRequest,
  DataIntegrationsUpsertApiKeyRequestResponse,
} from '../interfaces/data-integrations-upsert-api-key-request.interface';

export const serializeDataIntegrationsUpsertApiKeyRequest = (
  model: DataIntegrationsUpsertApiKeyRequest,
): DataIntegrationsUpsertApiKeyRequestResponse => ({
  user_id: model.userId,
  organization_id: model.organizationId,
  connected_account_id: model.connectedAccountId,
  connection_intent: model.connectionIntent,
  connection_owner: model.connectionOwner,
  secret: model.secret,
});
