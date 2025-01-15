import {
  WorkOS,
  HEADER_AUTHORIZATION,
  HEADER_IDEMPOTENCY_KEY,
} from '../workos';
import {
  DecryptKeyResult,
  DecryptKeyResponse,
  FetchKeyOptions,
  FetchKeyResult,
  FetchKeyResponse,
  KeyContext,
} from './interfaces';
import { encrypt } from './encrypt';
import { decrypt, decode } from './decrypt';
import { GetOptions, PostOptions, PutOptions } from '../common/interfaces';

export class EKM {
  constructor(private readonly workos: WorkOS) {}

  async fetchKey(options: FetchKeyOptions): Promise<FetchKeyResult> {
    const { data } = await this.post<FetchKeyResponse>(
      '/api/v1/keys/data-key',
      options,
    );
    return new FetchKeyResult(data);
  }

  async decryptKey(keys: string): Promise<DecryptKeyResult> {
    const { data } = await this.post<DecryptKeyResponse>(
      '/api/v1/keys/decrypt',
      { keys },
    );
    return new DecryptKeyResult(data);
  }

  async encrypt(data: string, context: KeyContext): Promise<string> {
    const { key, encryptedKeys } = await this.fetchKey({ context });
    return encrypt(data, key, encryptedKeys);
  }

  async decrypt(payload: string): Promise<string> {
    const decoded = decode(payload);
    const { dataKey } = await this.decryptKey(decoded.keys);
    return decrypt(decoded, dataKey);
  }

  async post<Result = any, Entity = any>(
    path: string,
    entity: Entity,
    options: PostOptions = {},
  ): Promise<{ data: Result }> {
    const requestHeaders: Record<string, string> = {};

    if (options.idempotencyKey) {
      requestHeaders[HEADER_IDEMPOTENCY_KEY] = options.idempotencyKey;
    }

    try {
      const res = await this.workos.ekmClient.post<Entity>(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });

      return { data: await res.toJSON() };
    } catch (error) {
      this.workos.handleHttpError({ path, error });

      throw error;
    }
  }

  async get<Result = any>(
    path: string,
    options: GetOptions = {},
  ): Promise<{ data: Result }> {
    const requestHeaders: Record<string, string> = {};

    if (options.accessToken) {
      requestHeaders[HEADER_AUTHORIZATION] = `Bearer ${options.accessToken}`;
    }

    try {
      const res = await this.workos.ekmClient.get(path, {
        params: options.query,
        headers: requestHeaders,
      });
      return { data: await res.toJSON() };
    } catch (error) {
      this.workos.handleHttpError({ path, error });

      throw error;
    }
  }

  async put<Result = any, Entity = any>(
    path: string,
    entity: Entity,
    options: PutOptions = {},
  ): Promise<{ data: Result }> {
    const requestHeaders: Record<string, string> = {};

    if (options.idempotencyKey) {
      requestHeaders[HEADER_IDEMPOTENCY_KEY] = options.idempotencyKey;
    }

    try {
      const res = await this.workos.ekmClient.put<Entity>(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });
      return { data: await res.toJSON() };
    } catch (error) {
      this.workos.handleHttpError({ path, error });

      throw error;
    }
  }

  async delete(path: string, query?: any): Promise<void> {
    try {
      await this.workos.ekmClient.delete(path, {
        params: query,
      });
    } catch (error) {
      this.workos.handleHttpError({ path, error });

      throw error;
    }
  }
}
