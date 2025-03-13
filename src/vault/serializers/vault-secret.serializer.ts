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
  SecretDigestResponse,
  SecretDigest,
} from '../interfaces';

export const deserializeSecretMetadata = (
  metadata: ReadSecretMetadataResponse,
): SecretMetadata => ({
  context: metadata.context,
  environmentId: metadata.environment_id,
  id: metadata.id,
  keyId: metadata.key_id,
  versionId: metadata.version_id,
  updatedAt: new Date(Date.parse(metadata.updated_at)),
});

export const deserializeSecret = (secret: ReadSecretResponse): VaultSecret => ({
  id: secret.id,
  name: secret.name,
  value: secret.value,
  metadata: deserializeSecretMetadata(secret.metadata),
});

const deserializeSecretDigest = (
  digest: SecretDigestResponse,
): SecretDigest => ({
  id: digest.id,
  name: digest.name,
  updatedAt: new Date(Date.parse(digest.updated_at)),
});

export const deserializeListSecrets = (
  list: ListSecretsResponse,
): SecretList => ({
  secrets: list.data.map(deserializeSecretDigest),
  metadata: list.list_metadata,
});

export const desrializeListSecretVersions = (
  list: SecretVersionResponse[],
): SecretVersion[] => list.map(deserializeSecretVersion);

const deserializeSecretVersion = (
  version: SecretVersionResponse,
): SecretVersion => ({
  createdAt: new Date(Date.parse(version.created_at)),
  currentVersion: version.current_version,
  id: version.id,
});

export const serializeCreateSecretEntity = (
  options: CreateSecretOptions,
): CreateSecretEntity => ({
  value: options.value,
  key_context: options.context,
});

export const serializeUpdateSecretEntity = (
  options: UpdateSecretOptions,
): UpdateSecretEntity => ({
  value: options.value,
  key_context: options.context,
  version_check: options.versionCheck,
});
