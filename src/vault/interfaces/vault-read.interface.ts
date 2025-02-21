import { VaultSecretContext } from './vault.interface';

export interface VaultReadOptions {
  name: string;
}

export interface VaultReadMetadataResponse {
  id: string;
  timestamp: string;
  context: VaultSecretContext;
  environment_id: string;
  key_id: string;
  updated_by: string;
}

export interface VaultReadResponse {
  id: string;
  metadata: VaultReadMetadataResponse;
  name: string;
  value: string;
}
