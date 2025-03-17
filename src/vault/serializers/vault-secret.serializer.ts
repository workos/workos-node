import { PaginationOptions } from '../../index.worker';
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
  ListSecretsPagination,
  ListSecretVersionsResponse,
} from '../interfaces';

export const deserializeSecretMetadata = (
  metadata: ReadSecretMetadataResponse,
): SecretMetadata => ({
  context: metadata.context,
  environmentId: metadata.environment_id,
  id: metadata.id,
  keyId: metadata.key_id,
  updatedAt: new Date(Date.parse(metadata.updated_at)),
  updatedBy: metadata.updated_by,
  versionId: metadata.version_id,
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

const deserializeListSecretsPagination = (
  pagination: ListSecretsPagination,
): PaginationOptions => ({
  after: pagination.after ?? undefined,
  before: pagination.before ?? undefined,
});

export const deserializeListSecrets = (
  list: ListSecretsResponse,
): SecretList => ({
  secrets: list.data.map(deserializeSecretDigest),
  pagination: deserializeListSecretsPagination(list.list_metadata),
});

export const desrializeListSecretVersions = (
  list: ListSecretVersionsResponse,
): SecretVersion[] => list.data.map(deserializeSecretVersion);

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
  name: options.name,
  value: options.value,
  key_context: options.context,
});

export const serializeUpdateSecretEntity = (
  options: UpdateSecretOptions,
): UpdateSecretEntity => ({
  value: options.value,
  version_check: options.versionCheck,
});
