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
import { FGA } from './fga/fga';
import { BadRequestException } from './common/exceptions/bad-request.exception';

import { HttpClient, HttpClientError } from './common/net/http-client';
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { FetchHttpClient } from './common/net/fetch-client';
import { IronSessionProvider } from './common/iron-session/iron-session-provider';
import { Widgets } from './widgets/widgets';
import { Actions } from './actions/actions';

const VERSION = '7.37.1';

const DEFAULT_HOSTNAME = 'api.workos.com';

const HEADER_AUTHORIZATION = 'Authorization';
const HEADER_IDEMPOTENCY_KEY = 'Idempotency-Key';
const HEADER_WARRANT_TOKEN = 'Warrant-Token';

export class WorkOS {
  readonly baseURL: string;
  readonly client: HttpClient;
  readonly clientId?: string;

  readonly actions: Actions;
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
  readonly userManagement: UserManagement;
  readonly fga = new FGA(this);
  readonly widgets = new Widgets(this);

  constructor(readonly key?: string, readonly options: WorkOSOptions = {}) {
    if (!key) {
      // process might be undefined in some environments
      this.key =
        typeof process !== 'undefined'
          ? process?.env.WORKOS_API_KEY
          : undefined;

      if (!this.key) {
        throw new NoApiKeyProvidedException();
      }
    }

    if (this.options.https === undefined) {
      this.options.https = true;
    }

    this.clientId = this.options.clientId;
    if (!this.clientId && typeof process !== 'undefined') {
      this.clientId = process?.env.WORKOS_CLIENT_ID;
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
    this.actions = this.createActionsClient();

    // Must initialize UserManagement after baseURL is configured
    this.userManagement = new UserManagement(
      this,
      this.createIronSessionProvider(),
    );

    this.client = this.createHttpClient(options, userAgent);
  }

  createWebhookClient() {
    return new Webhooks(new SubtleCryptoProvider());
  }

  createActionsClient() {
    return new Actions(new SubtleCryptoProvider());
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

  createIronSessionProvider(): IronSessionProvider {
    throw new Error(
      'IronSessionProvider not implemented. Use WorkOSNode or WorkOSWorker instead.',
    );
  }

  get version() {
    return VERSION;
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

    if (options.warrantToken) {
      requestHeaders[HEADER_WARRANT_TOKEN] = options.warrantToken;
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
    const requestHeaders: Record<string, string> = {};

    if (options.accessToken) {
      requestHeaders[HEADER_AUTHORIZATION] = `Bearer ${options.accessToken}`;
    }

    if (options.warrantToken) {
      requestHeaders[HEADER_WARRANT_TOKEN] = options.warrantToken;
    }

    try {
      const res = await this.client.get(path, {
        params: options.query,
        headers: requestHeaders,
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
    const requestHeaders: Record<string, string> = {};

    if (options.idempotencyKey) {
      requestHeaders[HEADER_IDEMPOTENCY_KEY] = options.idempotencyKey;
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
    // tslint:disable-next-line:no-console
    console.warn(`WorkOS: ${warning}`);
  }

  private handleHttpError({ path, error }: { path: string; error: unknown }) {
    if (!(error instanceof HttpClientError)) {
      throw new Error(`Unexpected error: ${error}`, { cause: error });
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
