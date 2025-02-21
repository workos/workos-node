import { VaultReadMetadataResponse, VaultReadResponse } from '../interfaces';
import {
  VaultSecret,
  VaultSecretMetadata,
} from '../interfaces/vault.interface';

const deserializeVaultSecretMetadata = (
  metadata: VaultReadMetadataResponse,
): VaultSecretMetadata => ({
  id: metadata.id,
  timestamp: new Date(metadata.timestamp),
  environmentId: metadata.environment_id,
  keyId: metadata.key_id,
  updatedBy: metadata.updated_by,
  context: metadata.context,
});

export const deserializeVaultSecret = (
  secret: VaultReadResponse,
): VaultSecret => ({
  id: secret.id,
  name: secret.name,
  value: secret.value,
  metadata: deserializeVaultSecretMetadata(secret.metadata),
});
