import { WorkOS } from '../workos';
import { VaultReadOptions, VaultReadResponse } from './interfaces';
import { deserializeVaultSecret } from './serializers/vault-secret.serializer';
import { VaultSecret } from './interfaces/vault.interface';
import { VaultListResponse } from './interfaces/vault-list.interface';
import { FetchHttpClient, HttpClient } from '../common/net';

const DEFAULT_VAULT_HOSTNAME = 'vault.workos.com';

export class Vault {
  readonly baseURL: string;
  readonly client: HttpClient;

  constructor(private readonly workos: WorkOS, userAgent: string) {
    const protocol: string = workos.options.https ? 'https' : 'http';
    const apiHostname: string =
      workos.options.vaultHostname || DEFAULT_VAULT_HOSTNAME;
    const port: number | undefined = workos.options.vaultPort;
    this.baseURL = `${protocol}://${apiHostname}`;

    if (port) {
      this.baseURL = this.baseURL + `:${port}`;
    }

    this.client = new FetchHttpClient(this.baseURL, {
      ...workos.options.config,
      headers: {
        ...workos.options.config?.headers,
        Authorization: `Bearer ${workos.key}`,
        'User-Agent': userAgent,
      },
    }) as HttpClient;
  }

  // TODO add pagination once supported by API
  async list(): Promise<string[]> {
    const { data } = await this.get<VaultListResponse>(`/api/v1/vault/kv`);
    return data.values;
  }

  async read(options: VaultReadOptions): Promise<VaultSecret> {
    const { data } = await this.get<VaultReadResponse>(
      `/api/v1/vault/kv/${options.name}`,
    );
    return deserializeVaultSecret(data);
  }

  async get<Result = any>(path: string): Promise<{ data: Result }> {
    try {
      const res = await this.client.get(path, {});
      return { data: await res.toJSON() };
    } catch (error) {
      this.workos.handleHttpError({ path, error });

      throw error;
    }
  }

  //   async post<Result = any, Entity = any>(
  //     path: string,
  //     entity: Entity,
  //     options: PostOptions = {},
  //   ): Promise<{ data: Result }> {
  //     const requestHeaders: Record<string, string> = {};

  //     if (options.idempotencyKey) {
  //       requestHeaders[HEADER_IDEMPOTENCY_KEY] = options.idempotencyKey;
  //     }

  //     try {
  //       const res = await this.workos.post<Entity>(path, entity, {
  //         params: options.query,
  //         headers: requestHeaders,
  //       });

  //       return { data: await res.toJSON() };
  //     } catch (error) {
  //       this.workos.handleHttpError({ path, error });

  //       throw error;
  //     }
  //   }

  //   async get<Result = any>(
  //     path: string,
  //     options: GetOptions = {},
  //   ): Promise<{ data: Result }> {
  //     const requestHeaders: Record<string, string> = {};

  //     if (options.accessToken) {
  //       requestHeaders[HEADER_AUTHORIZATION] = `Bearer ${options.accessToken}`;
  //     }

  //     try {
  //       const res = await this.workos.ekmClient.get(path, {
  //         params: options.query,
  //         headers: requestHeaders,
  //       });
  //       return { data: await res.toJSON() };
  //     } catch (error) {
  //       this.workos.handleHttpError({ path, error });

  //       throw error;
  //     }
  //   }

  //   async put<Result = any, Entity = any>(
  //     path: string,
  //     entity: Entity,
  //     options: PutOptions = {},
  //   ): Promise<{ data: Result }> {
  //     const requestHeaders: Record<string, string> = {};

  //     if (options.idempotencyKey) {
  //       requestHeaders[HEADER_IDEMPOTENCY_KEY] = options.idempotencyKey;
  //     }

  //     try {
  //       const res = await this.workos.ekmClient.put<Entity>(path, entity, {
  //         params: options.query,
  //         headers: requestHeaders,
  //       });
  //       return { data: await res.toJSON() };
  //     } catch (error) {
  //       this.workos.handleHttpError({ path, error });

  //       throw error;
  //     }
  //   }

  //   async delete(path: string, query?: any): Promise<void> {
  //     try {
  //       await this.workos.ekmClient.delete(path, {
  //         params: query,
  //       });
  //     } catch (error) {
  //       this.workos.handleHttpError({ path, error });

  //       throw error;
  //     }
  //   }
}
