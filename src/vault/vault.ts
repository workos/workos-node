import { PaginationOptions } from '../index.worker';
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
  ListSecretVersionsResponse,
  ReadSecretMetadataResponse,
  ReadSecretOptions,
  ReadSecretResponse,
  SecretContext,
  SecretList,
  SecretMetadata,
  SecretVersion,
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
      `/vault/v1/kv`,
      serializeCreateSecretEntity(options),
    );
    return deserializeSecretMetadata(data);
  }

  async listSecrets(
    options?: PaginationOptions | undefined,
  ): Promise<SecretList> {
    let url = '/vault/v1/kv';
    const params: string[] = [];
    if (options?.after) {
      params.push(`after=${encodeURIComponent(options.after)}`);
    }
    if (options?.limit) {
      params.push(`limit=${options.limit}`);
    }
    if (params.length > 0) {
      url = `${url}?${params.join('&')}`;
    }

    const { data } = await this.workos.get<ListSecretsResponse>(url);
    return deserializeListSecrets(data);
  }

  async listSecretVersions(
    options: ReadSecretOptions,
  ): Promise<SecretVersion[]> {
    const { data } = await this.workos.get<ListSecretVersionsResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.id)}/versions`,
    );
    return desrializeListSecretVersions(data);
  }

  async readSecret(options: ReadSecretOptions): Promise<VaultSecret> {
    const { data } = await this.workos.get<ReadSecretResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.id)}`,
    );
    return deserializeSecret(data);
  }

  async describeSecret(options: ReadSecretOptions): Promise<VaultSecret> {
    const { data } = await this.workos.get<ReadSecretResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.id)}/metadata`,
    );
    return deserializeSecret(data);
  }

  async updateSecret(options: UpdateSecretOptions): Promise<VaultSecret> {
    const { data } = await this.workos.put<ReadSecretResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.id)}`,
      serializeUpdateSecretEntity(options),
    );
    return deserializeSecret(data);
  }

  async deleteSecret(options: DeleteSecretOptions): Promise<void> {
    return this.workos.delete(`/vault/v1/kv/${encodeURIComponent(options.id)}`);
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
    const { dataKey, encryptedKeys } = await this.createDataKey({
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
