import { WorkOS } from '../workos';
import {
  CreateSecretOptions,
  DeleteSecretOptions,
  ListSecretsResponse,
  ReadSecretMetadataResponse,
  ReadSecretOptions,
  ReadSecretResponse,
  SecretList,
  SecretMetadata,
  SecretVersion,
  SecretVersionResponse,
  UpdateSecretOptions,
  VaultSecret,
} from './interfaces';
import {
  deserializeVaultListSecrets,
  deserializeVaultSecret,
  deserializeVaultSecretMetadata,
  desrializeVaultListSecretVersions,
  serializeVaultCreateSecretEntity,
  serializeVaultUpdateSecretEntity,
} from './serializers/vault-secret.serializer';

export class Vault {
  constructor(private readonly workos: WorkOS) {}

  async createSecret(
    options: CreateSecretOptions,
  ): Promise<SecretMetadata> {
    const { data } = await this.workos.post<ReadSecretMetadataResponse>(
      `/vault/v1/kv/${options.name}`,
      serializeVaultCreateSecretEntity(options),
    );
    return deserializeVaultSecretMetadata(data);
  }

  // TODO add pagination once supported by API
  async listSecrets(): Promise<SecretList> {
    const { data } = await this.workos.get<ListSecretsResponse>(`/vault/v1/kv`);
    return deserializeVaultListSecrets(data);
  }

  async listSecretVersions(
    options: ReadSecretOptions,
  ): Promise<SecretVersion[]> {
    const { data } = await this.workos.get<SecretVersionResponse[]>(
      `/vault/v1/kv/${encodeURIComponent(options.name)}/versions`,
    );
    return desrializeVaultListSecretVersions(data);
  }

  async readSecret(options: ReadSecretOptions): Promise<VaultSecret> {
    const { data } = await this.workos.get<ReadSecretResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.name)}`,
    );
    return deserializeVaultSecret(data);
  }

  async describeSecret(
    options: ReadSecretOptions,
  ): Promise<SecretMetadata> {
    const { data } = await this.workos.get<ReadSecretMetadataResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.name)}/metadata`,
    );
    return deserializeVaultSecretMetadata(data);
  }

  async updateSecret(
    options: UpdateSecretOptions,
  ): Promise<SecretMetadata> {
    const { data } = await this.workos.put<ReadSecretMetadataResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.name)}`,
      serializeVaultUpdateSecretEntity(options),
    );
    return deserializeVaultSecretMetadata(data);
  }

  async deleteSecret(options: DeleteSecretOptions): Promise<void> {
    return this.workos.delete(
      `/vault/v1/kv/${encodeURIComponent(options.name)}`,
    );
  }
}
