import {
  GenericServerException,
  NoApiKeyProvidedException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  OauthException,
  RateLimitExceededException,
} from './common/exceptions';
import {
  GetOptions,
  PostOptions,
  PutOptions,
  WorkOSOptions,
  WorkOSResponseError,
} from './common/interfaces';
import { DirectorySync } from './directory-sync/directory-sync';
import { Events } from './events/events';
import { Organizations } from './organizations/organizations';
import { OrganizationDomains } from './organization-domains/organization-domains';
import { Passwordless } from './passwordless/passwordless';
import { Portal } from './portal/portal';
import { SSO } from './sso/sso';
import { Webhooks } from './webhooks/webhooks';
import { Mfa } from './mfa/mfa';
import { AuditLogs } from './audit-logs/audit-logs';
import { UserManagement } from './user-management/user-management';
import { BadRequestException } from './common/exceptions/bad-request.exception';

import { HttpClient, HttpClientError } from './common/net/http-client';
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { FetchHttpClient } from './common/net/fetch-client';

const VERSION = '7.11.1';

const DEFAULT_HOSTNAME = 'api.workos.com';

export class WorkOS {
  readonly baseURL: string;
  readonly client: HttpClient;

  readonly auditLogs = new AuditLogs(this);
  readonly directorySync = new DirectorySync(this);
  readonly organizations = new Organizations(this);
  readonly organizationDomains = new OrganizationDomains(this);
  readonly passwordless = new Passwordless(this);
  readonly portal = new Portal(this);
  readonly sso = new SSO(this);
  readonly webhooks: Webhooks;
  readonly mfa = new Mfa(this);
  readonly events = new Events(this);
  readonly userManagement = new UserManagement(this);

  constructor(readonly key?: string, readonly options: WorkOSOptions = {}) {
    if (!key) {
      // process might be undefined in some environments
      this.key = process?.env.WORKOS_API_KEY;

      if (!this.key) {
        throw new NoApiKeyProvidedException();
      }
    }

    if (this.options.https === undefined) {
      this.options.https = true;
    }

    const protocol: string = this.options.https ? 'https' : 'http';
    const apiHostname: string = this.options.apiHostname || DEFAULT_HOSTNAME;
    const port: number | undefined = this.options.port;
    this.baseURL = `${protocol}://${apiHostname}`;

    if (port) {
      this.baseURL = this.baseURL + `:${port}`;
    }

    let userAgent: string = `workos-node/${VERSION}`;

    if (options.appInfo) {
      const { name, version }: { name: string; version: string } =
        options.appInfo;
      userAgent += ` ${name}: ${version}`;
    }

    this.webhooks = this.createWebhookClient();

    this.client = this.createHttpClient(options, userAgent);
  }

  createWebhookClient() {
    return new Webhooks(new SubtleCryptoProvider());
  }

  createHttpClient(options: WorkOSOptions, userAgent: string) {
    return new FetchHttpClient(this.baseURL, {
      ...options.config,
      headers: {
        ...options.config?.headers,
        Authorization: `Bearer ${this.key}`,
        'User-Agent': userAgent,
      },
    }) as HttpClient;
  }

  get version() {
    return VERSION;
  }

  async post<Result = any, Entity = any>(
    path: string,
    entity: Entity,
    options: PostOptions = {},
  ): Promise<{ data: Result }> {
    const requestHeaders: any = {};

    if (options.idempotencyKey) {
      requestHeaders['Idempotency-Key'] = options.idempotencyKey;
    }

    try {
      const res = await this.client.post<Entity>(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });

      return { data: await res.toJSON() };
    } catch (error) {
      this.handleHttpError({ path, error });

      throw error;
    }
  }

  async get<Result = any>(
    path: string,
    options: GetOptions = {},
  ): Promise<{ data: Result }> {
    try {
      const { accessToken } = options;
      const res = await this.client.get(path, {
        params: options.query,
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });
      return { data: await res.toJSON() };
    } catch (error) {
      this.handleHttpError({ path, error });

      throw error;
    }
  }

  async put<Result = any, Entity = any>(
    path: string,
    entity: Entity,
    options: PutOptions = {},
  ): Promise<{ data: Result }> {
    const requestHeaders: any = {};

    if (options.idempotencyKey) {
      requestHeaders['Idempotency-Key'] = options.idempotencyKey;
    }

    try {
      const res = await this.client.put<Entity>(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });
      return { data: await res.toJSON() };
    } catch (error) {
      this.handleHttpError({ path, error });

      throw error;
    }
  }

  async delete(path: string, query?: any): Promise<void> {
    try {
      await this.client.delete(path, {
        params: query,
      });
    } catch (error) {
      this.handleHttpError({ path, error });

      throw error;
    }
  }

  emitWarning(warning: string) {
    // process might be undefined in some environments
    if (typeof process?.emitWarning !== 'function') {
      //  tslint:disable:no-console
      return console.warn(`WorkOS: ${warning}`);
    }

    return process.emitWarning(warning, 'WorkOS');
  }

  private handleHttpError({ path, error }: { path: string; error: unknown }) {
    if (!(error instanceof HttpClientError)) {
      throw new Error(`Unexpected error: ${error}`);
    }

    const { response } = error as HttpClientError<WorkOSResponseError>;

    if (response) {
      const { status, data, headers } = response;

      const requestID = headers['X-Request-ID'] ?? '';
      const {
        code,
        error_description: errorDescription,
        error,
        errors,
        message,
      } = data;

      switch (status) {
        case 401: {
          throw new UnauthorizedException(requestID);
        }
        case 422: {
          throw new UnprocessableEntityException({
            code,
            errors,
            message,
            requestID,
          });
        }
        case 404: {
          throw new NotFoundException({
            code,
            message,
            path,
            requestID,
          });
        }
        case 429: {
          const retryAfter = headers.get('Retry-After');

          throw new RateLimitExceededException(
            data.message,
            requestID,
            retryAfter ? Number(retryAfter) : null,
          );
        }
        default: {
          if (error || errorDescription) {
            throw new OauthException(
              status,
              requestID,
              error,
              errorDescription,
              data,
            );
          } else if (code && errors) {
            // Note: ideally this should be mapped directly with a `400` status code.
            // However, this would break existing logic for the `OauthException` exception.
            throw new BadRequestException({
              code,
              errors,
              message,
              requestID,
            });
          } else {
            throw new GenericServerException(
              status,
              data.message,
              data,
              requestID,
            );
          }
        }
      }
    }
  }
}
