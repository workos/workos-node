import {
  ApiKeyRequiredException,
  GenericServerException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  OauthException,
  RateLimitExceededException,
} from './common/exceptions';
import { PKCE } from './pkce/pkce';
import {
  GetOptions,
  HttpClientResponseInterface,
  PatchOptions,
  PostOptions,
  PutOptions,
  WorkOSOptions,
  WorkOSResponseError,
} from './common/interfaces';
import { ApiKeys } from './api-keys/api-keys';
import { DirectorySync } from './directory-sync/directory-sync';
import { Events } from './events/events';
import { Organizations } from './organizations/organizations';
import { OrganizationDomains } from './organization-domains/organization-domains';
import { Passwordless } from './passwordless/passwordless';
import { Pipes } from './pipes/pipes';
import { Portal } from './portal/portal';
import { SSO } from './sso/sso';
import { Webhooks } from './webhooks/webhooks';
import { Mfa } from './mfa/mfa';
import { AuditLogs } from './audit-logs/audit-logs';
import { UserManagement } from './user-management/user-management';
import { FGA } from './fga/fga';
import { BadRequestException } from './common/exceptions/bad-request.exception';
import { FeatureFlags } from './feature-flags/feature-flags';

import { HttpClient, HttpClientError } from './common/net/http-client';
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { FetchHttpClient } from './common/net/fetch-client';
import { Widgets } from './widgets/widgets';
import { Actions } from './actions/actions';
import { Authorization } from './authorization/authorization';
import { Vault } from './vault/vault';
import { ConflictException } from './common/exceptions/conflict.exception';
import { CryptoProvider } from './common/crypto/crypto-provider';
import { ParseError } from './common/exceptions/parse-error';
import { getEnv } from './common/utils/env';
import { getRuntimeInfo } from './common/utils/runtime-info';

const VERSION = '8.3.0';

const DEFAULT_HOSTNAME = 'api.workos.com';

const HEADER_AUTHORIZATION = 'Authorization';
const HEADER_IDEMPOTENCY_KEY = 'Idempotency-Key';
const HEADER_WARRANT_TOKEN = 'Warrant-Token';

export class WorkOS {
  readonly baseURL: string;
  readonly client: HttpClient;
  readonly clientId?: string;
  readonly key?: string;
  readonly options: WorkOSOptions;
  readonly pkce: PKCE;

  private readonly hasApiKey: boolean;

  readonly actions: Actions;
  readonly apiKeys = new ApiKeys(this);
  readonly auditLogs = new AuditLogs(this);
  readonly authorization = new Authorization(this);
  readonly directorySync = new DirectorySync(this);
  readonly events = new Events(this);
  readonly featureFlags = new FeatureFlags(this);
  readonly fga = new FGA(this);
  readonly mfa = new Mfa(this);
  readonly organizations = new Organizations(this);
  readonly organizationDomains = new OrganizationDomains(this);
  readonly passwordless = new Passwordless(this);
  readonly pipes = new Pipes(this);
  readonly portal = new Portal(this);
  readonly sso = new SSO(this);
  readonly userManagement: UserManagement;
  readonly vault = new Vault(this);
  readonly webhooks: Webhooks;
  readonly widgets = new Widgets(this);

  /**
   * Create a new WorkOS client.
   *
   * @param keyOrOptions - API key string, or options object
   * @param maybeOptions - Options when first argument is API key
   *
   * @example
   * // Server-side with API key (string)
   * const workos = new WorkOS('sk_...');
   *
   * @example
   * // Server-side with API key (object)
   * const workos = new WorkOS({ apiKey: 'sk_...', clientId: 'client_...' });
   *
   * @example
   * // PKCE/public client (no API key)
   * const workos = new WorkOS({ clientId: 'client_...' });
   */
  constructor(
    keyOrOptions?: string | WorkOSOptions,
    maybeOptions?: WorkOSOptions,
  ) {
    if (typeof keyOrOptions === 'object') {
      this.key = keyOrOptions.apiKey;
      this.options = keyOrOptions;
    } else {
      this.key = keyOrOptions;
      this.options = maybeOptions ?? {};
    }

    if (!this.key) {
      this.key = getEnv('WORKOS_API_KEY');
    }

    this.hasApiKey = !!this.key;

    if (this.options.https === undefined) {
      this.options.https = true;
    }

    this.clientId = this.options.clientId;
    if (!this.clientId) {
      this.clientId = getEnv('WORKOS_CLIENT_ID');
    }

    if (!this.hasApiKey && !this.clientId) {
      throw new Error(
        'WorkOS requires either an API key or a clientId. ' +
          'For server-side: new WorkOS("sk_...") or new WorkOS({ apiKey: "sk_..." }). ' +
          'For PKCE/public clients: new WorkOS({ clientId: "client_..." })',
      );
    }

    const protocol: string = this.options.https ? 'https' : 'http';
    const apiHostname: string = this.options.apiHostname || DEFAULT_HOSTNAME;
    const port: number | undefined = this.options.port;
    this.baseURL = `${protocol}://${apiHostname}`;

    if (port) {
      this.baseURL = this.baseURL + `:${port}`;
    }

    this.pkce = new PKCE();

    this.webhooks = this.createWebhookClient();
    this.actions = this.createActionsClient();

    // Must initialize UserManagement after baseURL is configured
    this.userManagement = new UserManagement(this);

    const userAgent = this.createUserAgent(this.options);

    this.client = this.createHttpClient(this.options, userAgent);
  }

  private createUserAgent(options: WorkOSOptions): string {
    let userAgent: string = `workos-node/${VERSION}`;

    const { name: runtimeName, version: runtimeVersion } = getRuntimeInfo();
    userAgent += ` (${runtimeName}${runtimeVersion ? `/${runtimeVersion}` : ''})`;

    if (options.appInfo) {
      const { name, version } = options.appInfo;
      userAgent += ` ${name}: ${version}`;
    }

    return userAgent;
  }

  createWebhookClient() {
    return new Webhooks(this.getCryptoProvider());
  }

  createActionsClient() {
    return new Actions(this.getCryptoProvider());
  }

  getCryptoProvider(): CryptoProvider {
    return new SubtleCryptoProvider();
  }

  createHttpClient(options: WorkOSOptions, userAgent: string) {
    const headers: Record<string, string> = {
      'User-Agent': userAgent,
    };

    const configHeaders = options.config?.headers;
    if (
      configHeaders &&
      typeof configHeaders === 'object' &&
      !Array.isArray(configHeaders) &&
      !(configHeaders instanceof Headers)
    ) {
      Object.assign(headers, configHeaders);
    }

    if (this.key) {
      headers['Authorization'] = `Bearer ${this.key}`;
    }

    return new FetchHttpClient(this.baseURL, {
      ...options.config,
      timeout: options.timeout,
      headers,
    }) as HttpClient;
  }

  get version() {
    return VERSION;
  }

  /**
   * Require API key for methods that need it.
   * @param methodName - Name of the method requiring API key (for error message)
   * @throws ApiKeyRequiredException if no API key was provided
   */
  requireApiKey(methodName: string): void {
    if (!this.hasApiKey) {
      throw new ApiKeyRequiredException(methodName);
    }
  }

  async post<Result = any, Entity = any>(
    path: string,
    entity: Entity,
    options: PostOptions = {},
  ): Promise<{ data: Result }> {
    if (!options.skipApiKeyCheck) {
      this.requireApiKey(path);
    }

    const requestHeaders: Record<string, string> = {};

    if (options.idempotencyKey) {
      requestHeaders[HEADER_IDEMPOTENCY_KEY] = options.idempotencyKey;
    }

    if (options.warrantToken) {
      requestHeaders[HEADER_WARRANT_TOKEN] = options.warrantToken;
    }

    let res: HttpClientResponseInterface;

    try {
      res = await this.client.post<Entity>(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });
    } catch (error) {
      this.handleHttpError({ path, error });
      throw error;
    }

    try {
      return { data: await res.toJSON() };
    } catch (error) {
      await this.handleParseError(error, res);
      throw error;
    }
  }

  async get<Result = any>(
    path: string,
    options: GetOptions = {},
  ): Promise<{ data: Result }> {
    if (!options.skipApiKeyCheck) {
      this.requireApiKey(path);
    }

    const requestHeaders: Record<string, string> = {};

    if (options.accessToken) {
      requestHeaders[HEADER_AUTHORIZATION] = `Bearer ${options.accessToken}`;
    }

    if (options.warrantToken) {
      requestHeaders[HEADER_WARRANT_TOKEN] = options.warrantToken;
    }

    let res: HttpClientResponseInterface;
    try {
      res = await this.client.get(path, {
        params: options.query,
        headers: requestHeaders,
      });
    } catch (error) {
      this.handleHttpError({ path, error });

      throw error;
    }

    try {
      return { data: await res.toJSON() };
    } catch (error) {
      await this.handleParseError(error, res);
      throw error;
    }
  }

  async put<Result = any, Entity = any>(
    path: string,
    entity: Entity,
    options: PutOptions = {},
  ): Promise<{ data: Result }> {
    if (!options.skipApiKeyCheck) {
      this.requireApiKey(path);
    }

    const requestHeaders: Record<string, string> = {};

    if (options.idempotencyKey) {
      requestHeaders[HEADER_IDEMPOTENCY_KEY] = options.idempotencyKey;
    }

    let res: HttpClientResponseInterface;

    try {
      res = await this.client.put<Entity>(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });
    } catch (error) {
      this.handleHttpError({ path, error });

      throw error;
    }

    try {
      return { data: await res.toJSON() };
    } catch (error) {
      await this.handleParseError(error, res);
      throw error;
    }
  }

  async patch<Result = any, Entity = any>(
    path: string,
    entity: Entity,
    options: PatchOptions = {},
  ): Promise<{ data: Result }> {
    if (!options.skipApiKeyCheck) {
      this.requireApiKey(path);
    }

    const requestHeaders: Record<string, string> = {};

    if (options.idempotencyKey) {
      requestHeaders[HEADER_IDEMPOTENCY_KEY] = options.idempotencyKey;
    }

    let res: HttpClientResponseInterface;

    try {
      res = await this.client.patch<Entity>(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });
    } catch (error) {
      this.handleHttpError({ path, error });

      throw error;
    }

    try {
      return { data: await res.toJSON() };
    } catch (error) {
      await this.handleParseError(error, res);
      throw error;
    }
  }

  async delete(path: string, query?: any): Promise<void> {
    this.requireApiKey(path);

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

  private async handleParseError(
    error: unknown,
    res: HttpClientResponseInterface,
  ) {
    if (error instanceof SyntaxError) {
      const rawResponse = res.getRawResponse() as Response;
      const requestID = rawResponse.headers.get('X-Request-ID') ?? '';
      const rawStatus = rawResponse.status;
      const rawBody = await rawResponse.text();
      throw new ParseError({
        message: error.message,
        rawBody,
        rawStatus,
        requestID,
      });
    }
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
        case 409: {
          throw new ConflictException({ requestID, message, error });
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
