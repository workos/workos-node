// @oagen-ignore-file
// Keep snake_case serialization for the legacy flat options and exact selectors.

import type {
  DataIntegrationsUpsertClientCredentialsRequest,
  DataIntegrationsUpsertClientCredentialsRequestResponse,
} from '../interfaces/data-integrations-upsert-client-credentials-request.interface';

export const serializeDataIntegrationsUpsertClientCredentialsRequest = (
  model: DataIntegrationsUpsertClientCredentialsRequest,
): DataIntegrationsUpsertClientCredentialsRequestResponse => ({
  user_id: model.userId,
  organization_id: model.organizationId,
  connected_account_id: model.connectedAccountId,
  connection_intent: model.connectionIntent,
  connection_owner: model.connectionOwner,
  client_id: model.clientId,
  client_secret: model.clientSecret,
  config: model.config,
});
