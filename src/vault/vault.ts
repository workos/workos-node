import { WorkOS } from '../workos';
import { decode, decrypt } from './cryptography/decrypt';
import { encrypt } from './cryptography/encrypt';
import {
  CreateDataKeyOptions,
  CreateDataKeyResponse,
  CreateSecretOptions,
  DecryptDataKeyOptions,
  DecryptDataKeyResponse,
  DeleteSecretOptions,
  ListSecretsResponse,
  ReadSecretMetadataResponse,
  ReadSecretOptions,
  ReadSecretResponse,
  SecretContext,
  SecretList,
  SecretMetadata,
  SecretVersion,
  SecretVersionResponse,
  UpdateSecretOptions,
  VaultSecret,
} from './interfaces';
import { DataKey, DataKeyPair } from './interfaces/key.interface';
import {
  deserializeCreateDataKeyResponse,
  deserializeDecryptDataKeyResponse,
} from './serializers/vault-key.serializer';
import {
  deserializeListSecrets,
  deserializeSecret,
  deserializeSecretMetadata,
  desrializeListSecretVersions,
  serializeCreateSecretEntity,
  serializeUpdateSecretEntity,
} from './serializers/vault-secret.serializer';

export class Vault {
  constructor(private readonly workos: WorkOS) {}

  async createSecret(options: CreateSecretOptions): Promise<SecretMetadata> {
    const { data } = await this.workos.post<ReadSecretMetadataResponse>(
      `/vault/v1/kv/${options.name}`,
      serializeCreateSecretEntity(options),
    );
    return deserializeSecretMetadata(data);
  }

  // TODO add pagination once supported by API
  async listSecrets(): Promise<SecretList> {
    const { data } = await this.workos.get<ListSecretsResponse>(`/vault/v1/kv`);
    return deserializeListSecrets(data);
  }

  async listSecretVersions(
    options: ReadSecretOptions,
  ): Promise<SecretVersion[]> {
    const { data } = await this.workos.get<SecretVersionResponse[]>(
      `/vault/v1/kv/${encodeURIComponent(options.name)}/versions`,
    );
    return desrializeListSecretVersions(data);
  }

  async readSecret(options: ReadSecretOptions): Promise<VaultSecret> {
    const { data } = await this.workos.get<ReadSecretResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.name)}`,
    );
    return deserializeSecret(data);
  }

  async describeSecret(options: ReadSecretOptions): Promise<SecretMetadata> {
    const { data } = await this.workos.get<ReadSecretMetadataResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.name)}/metadata`,
    );
    return deserializeSecretMetadata(data);
  }

  async updateSecret(options: UpdateSecretOptions): Promise<SecretMetadata> {
    const { data } = await this.workos.put<ReadSecretMetadataResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.name)}`,
      serializeUpdateSecretEntity(options),
    );
    return deserializeSecretMetadata(data);
  }

  async deleteSecret(options: DeleteSecretOptions): Promise<void> {
    return this.workos.delete(
      `/vault/v1/kv/${encodeURIComponent(options.name)}`,
    );
  }

  async createDataKey(options: CreateDataKeyOptions): Promise<DataKeyPair> {
    const { data } = await this.workos.post<CreateDataKeyResponse>(
      `/vault/v1/keys/data-key`,
      options,
    );
    return deserializeCreateDataKeyResponse(data);
  }

  async decryptDataKey(options: DecryptDataKeyOptions): Promise<DataKey> {
    const { data } = await this.workos.post<DecryptDataKeyResponse>(
      `/vault/v1/keys/decrypt`,
      options,
    );
    return deserializeDecryptDataKeyResponse(data);
  }

  async encrypt(data: string, context: SecretContext): Promise<string> {
    const { dataKey, encryptedKey: encryptedKeys } = await this.createDataKey({
      context,
    });
    return encrypt(data, dataKey.key, encryptedKeys);
  }

  async decrypt(encryptedData: string): Promise<string> {
    const decoded = decode(encryptedData);
    const dataKey = await this.decryptDataKey({ keys: decoded.keys });
    return decrypt(decoded, dataKey.key);
  }
}
