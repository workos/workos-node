import {
  SecretList,
  ListSecretsResponse,
  ReadSecretMetadataResponse,
  ReadSecretResponse,
  UpdateSecretOptions,
  UpdateSecretEntity,
  SecretMetadata,
  VaultSecret,
  SecretVersionResponse,
  SecretVersion,
  CreateSecretOptions,
  CreateSecretEntity,
} from '../interfaces';

export const deserializeVaultSecretMetadata = (
  metadata: ReadSecretMetadataResponse,
): SecretMetadata => ({
  context: metadata.context,
  environmentId: metadata.environment_id,
  id: metadata.id,
  keyId: metadata.key_id,
  versionId: metadata.version_id,
  updatedAt: new Date(Date.parse(metadata.updated_at)),
});

export const deserializeVaultSecret = (
  secret: ReadSecretResponse,
): VaultSecret => ({
  id: secret.id,
  name: secret.name,
  value: secret.value,
  metadata: deserializeVaultSecretMetadata(secret.metadata),
});

export const deserializeVaultListSecrets = (
  list: ListSecretsResponse,
): SecretList => ({
  secrets: list.data,
  metadata: list.list_metadata,
});

export const desrializeVaultListSecretVersions = (
  list: SecretVersionResponse[],
): SecretVersion[] => list.map(deserializeVaultSecretVersion);

export const deserializeVaultSecretVersion = (
  version: SecretVersionResponse,
): SecretVersion => ({
  createdAt: new Date(Date.parse(version.created_at)),
  currentVersion: version.current_version,
  id: version.id,
});

export const serializeVaultCreateSecretEntity = (
  options: CreateSecretOptions,
): CreateSecretEntity => ({
  value: options.value,
  key_context: options.context,
});

export const serializeVaultUpdateSecretEntity = (
  options: UpdateSecretOptions,
): UpdateSecretEntity => ({
  value: options.value,
  key_context: options.context,
  version_check: options.versionCheck,
});
