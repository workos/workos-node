// @oagen-ignore-file
// Preserve the published flat options across the API's compatibility/reauthorize union.

import type { DataIntegrationsUpsertClientCredentialsRequestConnectionOwner } from './data-integrations-upsert-client-credentials-request-connection-owner.interface';

export interface DataIntegrationsUpsertClientCredentialsRequest {
  /** A [User](https://workos.com/docs/reference/authkit/user) identifier. */
  userId: string;
  /** An [Organization](https://workos.com/docs/reference/organization) identifier. Optional parameter to scope the connection to a specific organization. Required when `connection_owner` is `organization`. */
  organizationId?: string;
  /** A [connected account](https://workos.com/docs/reference/pipes/connected-account) identifier. Use this to rotate a specific existing connection. */
  connectedAccountId?: string;
  /** Reauthorize the named connected account. Requires `connectedAccountId`; omit both to upsert the compatibility connection. Use POST to add a connection. */
  connectionIntent?: 'reauthorize';
  /** Whose connection to create or rotate. `user` (the default) addresses the connection owned by `user_id`. `organization` addresses the connection shared by every member of `organization_id`; `user_id` then identifies the member performing the request and must be an active member of the organization. */
  connectionOwner?: DataIntegrationsUpsertClientCredentialsRequestConnectionOwner;
  /** The OAuth client ID to store for this integration. */
  clientId: string;
  /** The OAuth client secret to store for this integration. */
  clientSecret: string;
  /** Provider-specific configuration values collected for this installation, keyed by the provider's config field descriptors. */
  config?: Record<string, string>;
}

export interface DataIntegrationsUpsertClientCredentialsRequestResponse {
  user_id: string;
  organization_id?: string;
  connected_account_id?: string;
  connection_intent?: 'reauthorize';
  connection_owner?: DataIntegrationsUpsertClientCredentialsRequestConnectionOwner;
  client_id: string;
  client_secret: string;
  config?: Record<string, string>;
}
