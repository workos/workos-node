import { decodeUInt32, encodeUInt32 } from 'leb';
import { CryptoProvider } from '../common/crypto/crypto-provider';
import { List, ListResponse } from '../common/interfaces';
import { PaginationOptions } from '../index.worker';
import { WorkOS } from '../workos';
import {
  CreateDataKeyOptions,
  CreateDataKeyResponse,
  CreateObjectOptions,
  DataKey,
  DataKeyPair,
  DecryptDataKeyOptions,
  DecryptDataKeyResponse,
  DeleteObjectOptions,
  KeyContext,
  ListObjectVersionsResponse,
  ObjectDigest,
  ObjectDigestResponse,
  ObjectMetadata,
  ObjectVersion,
  ReadObjectMetadataResponse,
  ReadObjectOptions,
  ReadObjectResponse,
  UpdateObjectOptions,
  VaultObject,
} from './interfaces';
import {
  deserializeCreateDataKeyResponse,
  deserializeDecryptDataKeyResponse,
} from './serializers/vault-key.serializer';
import {
  deserializeListObjects,
  deserializeObject,
  deserializeObjectMetadata,
  desrializeListObjectVersions,
  serializeCreateObjectEntity,
  serializeUpdateObjectEntity,
} from './serializers/vault-object.serializer';

interface Decoded {
  iv: Uint8Array;
  tag: Uint8Array;
  keys: string;
  ciphertext: Uint8Array;
}

export class Vault {
  private cryptoProvider: CryptoProvider;

  constructor(private readonly workos: WorkOS) {
    this.cryptoProvider = workos.getCryptoProvider();
  }

  private decode(payload: string): Decoded {
    const inputData = Buffer.from(payload, 'base64');
    // Use 12 bytes for IV (standard for AES-GCM)
    const iv = new Uint8Array(inputData.subarray(0, 12));
    const tag = new Uint8Array(inputData.subarray(12, 28));
    const { value: keyLen, nextIndex } = decodeUInt32(inputData, 28);

    // Use subarray instead of slice and convert directly to base64
    const keysBuffer = inputData.subarray(nextIndex, nextIndex + keyLen);
    const keys = Buffer.from(keysBuffer).toString('base64');

    const ciphertext = new Uint8Array(inputData.subarray(nextIndex + keyLen));

    return {
      iv,
      tag,
      keys,
      ciphertext,
    };
  }

  async createObject(options: CreateObjectOptions): Promise<ObjectMetadata> {
    const { data } = await this.workos.post<ReadObjectMetadataResponse>(
      `/vault/v1/kv`,
      serializeCreateObjectEntity(options),
    );
    return deserializeObjectMetadata(data);
  }

  async listObjects(
    options?: PaginationOptions | undefined,
  ): Promise<List<ObjectDigest>> {
    const url = new URL('/vault/v1/kv', this.workos.baseURL);
    if (options?.after) {
      url.searchParams.set('after', options.after);
    }
    if (options?.limit) {
      url.searchParams.set('limit', options.limit.toString());
    }

    const { data } = await this.workos.get<ListResponse<ObjectDigestResponse>>(
      url.toString(),
    );
    return deserializeListObjects(data);
  }

  async listObjectVersions(
    options: ReadObjectOptions,
  ): Promise<ObjectVersion[]> {
    const { data } = await this.workos.get<ListObjectVersionsResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.id)}/versions`,
    );
    return desrializeListObjectVersions(data);
  }

  async readObject(options: ReadObjectOptions): Promise<VaultObject> {
    const { data } = await this.workos.get<ReadObjectResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.id)}`,
    );
    return deserializeObject(data);
  }

  async describeObject(options: ReadObjectOptions): Promise<VaultObject> {
    const { data } = await this.workos.get<ReadObjectResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.id)}/metadata`,
    );
    return deserializeObject(data);
  }

  async updateObject(options: UpdateObjectOptions): Promise<VaultObject> {
    const { data } = await this.workos.put<ReadObjectResponse>(
      `/vault/v1/kv/${encodeURIComponent(options.id)}`,
      serializeUpdateObjectEntity(options),
    );
    return deserializeObject(data);
  }

  async deleteObject(options: DeleteObjectOptions): Promise<void> {
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

  async encrypt(
    data: string,
    context: KeyContext,
    associatedData?: string,
  ): Promise<string> {
    const keyPair = await this.createDataKey({
      context,
    });

    // Convert base64 key to Uint8Array
    const encoder = new TextEncoder();

    // Decode the base64 key string to a binary string, then to a Uint8Array
    const keyBase64Decoded = atob(keyPair.dataKey.key);
    const key = new Uint8Array(keyBase64Decoded.length);
    for (let i = 0; i < keyBase64Decoded.length; i++) {
      key[i] = keyBase64Decoded.charCodeAt(i);
    }

    // Same for encrypted keys
    const encKeysBase64Decoded = atob(keyPair.encryptedKeys);
    const keyBlob = new Uint8Array(encKeysBase64Decoded.length);
    for (let i = 0; i < encKeysBase64Decoded.length; i++) {
      keyBlob[i] = encKeysBase64Decoded.charCodeAt(i);
    }

    const prefixLenBuffer = encodeUInt32(keyBlob.length);
    const aadBuffer = associatedData
      ? encoder.encode(associatedData)
      : undefined;

    // Use a 12-byte IV for AES-GCM (industry standard)
    const iv = this.cryptoProvider.randomBytes(12);

    const {
      ciphertext,
      iv: resultIv,
      tag,
    } = await this.cryptoProvider.encrypt(
      encoder.encode(data),
      key,
      iv,
      aadBuffer,
    );

    // Concatenate all parts into a single array
    const resultArray = new Uint8Array(
      resultIv.length +
        tag.length +
        prefixLenBuffer.length +
        keyBlob.length +
        ciphertext.length,
    );

    let offset = 0;
    resultArray.set(resultIv, offset);
    offset += resultIv.length;

    resultArray.set(tag, offset);
    offset += tag.length;

    resultArray.set(new Uint8Array(prefixLenBuffer), offset);
    offset += prefixLenBuffer.length;

    resultArray.set(keyBlob, offset);
    offset += keyBlob.length;

    resultArray.set(ciphertext, offset);

    // Convert to base64
    const resultBuffer = Buffer.from(resultArray);
    return resultBuffer.toString('base64');
  }

  async decrypt(
    encryptedData: string,
    associatedData?: string,
  ): Promise<string> {
    const decoded = this.decode(encryptedData);
    const dataKey = await this.decryptDataKey({ keys: decoded.keys });

    // Convert base64 key to Uint8Array
    const keyBase64Decoded = atob(dataKey.key);
    const key = new Uint8Array(keyBase64Decoded.length);
    for (let i = 0; i < keyBase64Decoded.length; i++) {
      key[i] = keyBase64Decoded.charCodeAt(i);
    }

    const encoder = new TextEncoder();
    const aadBuffer = associatedData
      ? encoder.encode(associatedData)
      : undefined;

    const decrypted = await this.cryptoProvider.decrypt(
      decoded.ciphertext,
      key,
      decoded.iv,
      decoded.tag,
      aadBuffer,
    );

    return new TextDecoder().decode(decrypted);
  }
}
