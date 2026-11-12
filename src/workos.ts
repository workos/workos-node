// @oagen-ignore-file
import {
  ApiKeyRequiredException,
  AuthenticationException,
  GenericServerException,
  isAuthenticationErrorData,
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
import { Agents } from './agents/agents';
import { ApiKeys } from './api-keys/api-keys';
import { Connect } from './connect/connect';
import { DirectorySync } from './directory-sync/directory-sync';
import { Events } from './events/events';
import { Organizations } from './organizations/organizations';
import { OrganizationDomains } from './organization-domains/organization-domains';
import { Passwordless } from './passwordless/passwordless';
import { Pipes } from './pipes/pipes';
import { Radar } from './radar/radar';
import { AdminPortal } from './admin-portal/admin-portal';
import { SSO } from './sso/sso';
import { Webhooks } from './webhooks/webhooks';
import { MultiFactorAuth } from './multi-factor-auth/multi-factor-auth';
import { AuditLogs } from './audit-logs/audit-logs';
import { UserManagement } from './user-management/user-management';
import { BadRequestException } from './common/exceptions/bad-request.exception';
import { FeatureFlags } from './feature-flags/feature-flags';
import { Groups } from './groups/groups';

import { HttpClient, HttpClientError } from './common/net/http-client';
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { FetchHttpClient } from './common/net/fetch-client';
import { Widgets } from './widgets/widgets';
import { Actions } from './actions/actions';
import { Authorization } from './authorization/authorization';
import { Vault } from './vault/vault';
import { ConflictException } from './common/exceptions/conflict.exception';
import { CryptoProvider } from './common/crypto/crypto-provider';
import { getEnv } from './common/utils/env';
import { ParseError } from './common/exceptions/parse-error';
import { WorkloadIdentityTokenProvider } from './workload-identity/workload-identity-token-provider';
import { version as VERSION } from '../package.json' with { type: 'json' };

const DEFAULT_HOSTNAME = 'api.workos.com';

const HEADER_AUTHORIZATION = 'Authorization';
const HEADER_IDEMPOTENCY_KEY = 'Idempotency-Key';
const HEADER_WARRANT_TOKEN = 'Warrant-Token';

function isUnauthorizedResponse(error: unknown): boolean {
  if (error instanceof HttpClientError) {
    return error.response?.status === 401;
  }

  return error instanceof ParseError && error.rawStatus === 401;
}

/** WorkOS REST API */
export class WorkOS {
  readonly baseURL: string;
  readonly client: HttpClient;
  readonly clientId?: string;
  readonly key?: string;
  readonly options: WorkOSOptions;
  readonly pkce: PKCE;

  private readonly hasApiKey: boolean;
  private readonly workloadIdentity?: WorkloadIdentityTokenProvider;

  readonly actions: Actions;
  readonly agents = new Agents(this);
  readonly apiKeys = new ApiKeys(this);
  readonly auditLogs = new AuditLogs(this);
  readonly authorization = new Authorization(this);
  readonly directorySync = new DirectorySync(this);
  readonly connect = new Connect(this);
  readonly events = new Events(this);
  readonly featureFlags = new FeatureFlags(this);
  readonly groups = new Groups(this);
  readonly multiFactorAuth = new MultiFactorAuth(this);
  readonly organizations = new Organizations(this);
  readonly organizationDomains = new OrganizationDomains(this);
  readonly passwordless = new Passwordless(this);
  readonly pipes = new Pipes(this);
  readonly radar = new Radar(this);
  readonly adminPortal = new AdminPortal(this);
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
   *
   * @example
   * // Workload identity (no API key)
   * const workos = new WorkOS({
   *   workloadIdentity: { clientId: 'client_...', tokenSource, tokenEndpoint },
   * });
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

    const workloadIdentity = this.options.workloadIdentity;

    if (workloadIdentity && this.key) {
      throw new Error(
        'WorkOS accepts either an API key or workloadIdentity, not both.',
      );
    }

    // An explicit workload identity wins over WORKOS_API_KEY in the environment.
    if (!this.key && !workloadIdentity) {
      this.key = getEnv('WORKOS_API_KEY');
    }

    // A workload identity authenticates the same endpoints an API key does.
    this.hasApiKey = !!this.key || !!workloadIdentity;

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

    if (workloadIdentity) {
      this.workloadIdentity = new WorkloadIdentityTokenProvider(
        workloadIdentity,
        {
          fetchFn: this.options.fetchFn,
          timeout: this.options.timeout,
          userAgent,
        },
      );
    }

    this.client = this.createHttpClient(this.options, userAgent);
  }

  private createUserAgent(_options: WorkOSOptions): string {
    return `workos-node/${VERSION}`;
  }

  createWebhookClient() {
    return new Webhooks(this);
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
      maxRetries: options.maxRetries,
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

    const res = await this.sendRequest(
      path,
      requestHeaders,
      !options.skipApiKeyCheck,
      (headers) =>
        this.client.post<Entity>(path, entity, {
          params: options.query,
          headers,
          maxRetries: options.maxRetries,
        }),
    );

    return { data: await this.readResponseJSON(path, res) };
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

    const res = await this.sendRequest(
      path,
      requestHeaders,
      !options.skipApiKeyCheck,
      (headers) =>
        this.client.get(path, {
          params: options.query,
          headers,
          maxRetries: options.maxRetries,
        }),
    );

    return { data: await this.readResponseJSON(path, res) };
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

    const res = await this.sendRequest(
      path,
      requestHeaders,
      !options.skipApiKeyCheck,
      (headers) =>
        this.client.put<Entity>(path, entity, {
          params: options.query,
          headers,
          maxRetries: options.maxRetries,
        }),
    );

    return { data: await this.readResponseJSON(path, res) };
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

    const res = await this.sendRequest(
      path,
      requestHeaders,
      !options.skipApiKeyCheck,
      (headers) =>
        this.client.patch<Entity>(path, entity, {
          params: options.query,
          headers,
          maxRetries: options.maxRetries,
        }),
    );

    return { data: await this.readResponseJSON(path, res) };
  }

  async delete(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<void> {
    this.requireApiKey(path);

    await this.sendRequest(path, {}, true, (headers) =>
      this.client.delete(path, {
        params: query,
        headers,
      }),
    );
  }

  async deleteWithBody<Entity = any>(
    path: string,
    entity: Entity,
  ): Promise<void> {
    this.requireApiKey(path);

    await this.sendRequest(path, {}, true, (headers) =>
      this.client.deleteWithBody(path, entity, { headers }),
    );
  }

  /**
   * Send one request and translate a transport failure into an SDK exception.
   *
   * With a workload identity the access token and environment headers are
   * added here, unless the caller set its own `Authorization` header or the
   * call is one that authenticates with a client secret, not an API key
   * (`skipApiKeyCheck`): a machine token is not a client secret. A 401
   * means the token was rejected, so it is dropped, exchanged again and the
   * request is sent once more. The exchange runs outside the translation so
   * its own errors (for example an `OauthException`) reach the caller as is.
   */
  private async sendRequest(
    path: string,
    headers: Record<string, string>,
    usesWorkloadIdentity: boolean,
    send: (
      headers: Record<string, string>,
    ) => Promise<HttpClientResponseInterface>,
  ): Promise<HttpClientResponseInterface> {
    const workloadIdentity = this.workloadIdentity;

    if (
      !workloadIdentity ||
      !usesWorkloadIdentity ||
      HEADER_AUTHORIZATION in headers
    ) {
      return this.sendTranslated(path, () => send(headers));
    }

    const accessToken = await workloadIdentity.getAccessToken();

    try {
      return await send({
        ...headers,
        ...workloadIdentity.requestHeaders(accessToken),
      });
    } catch (error) {
      if (!isUnauthorizedResponse(error)) {
        this.handleHttpError({ path, error });

        throw error;
      }
    }

    workloadIdentity.invalidate(accessToken);
    const freshAccessToken = await workloadIdentity.getAccessToken();

    return this.sendTranslated(path, () =>
      send({
        ...headers,
        ...workloadIdentity.requestHeaders(freshAccessToken),
      }),
    );
  }

  private async sendTranslated(
    path: string,
    send: () => Promise<HttpClientResponseInterface>,
  ): Promise<HttpClientResponseInterface> {
    try {
      return await send();
    } catch (error) {
      this.handleHttpError({ path, error });

      throw error;
    }
  }

  /**
   * Consume a successful response body. The request deadline covers the body,
   * so a stall while it is still streaming surfaces from the transport as a
   * 408 `HttpClientError` and is translated like a timeout before the headers.
   * Everything else (a `ParseError` for malformed JSON, a network failure
   * mid-body) propagates unchanged.
   */
  /** @internal */
  async readResponseJSON(
    path: string,
    response: HttpClientResponseInterface,
  ): Promise<any> {
    try {
      return await response.toJSON();
    } catch (error) {
      if (error instanceof HttpClientError) {
        this.handleHttpError({ path, error });
      }

      throw error;
    }
  }

  emitWarning(warning: string) {
    // tslint:disable-next-line:no-console
    console.warn(`WorkOS: ${warning}`);
  }

  /** @internal */
  handleHttpError({ path, error }: { path: string; error: unknown }) {
    if (!(error instanceof HttpClientError)) {
      throw new Error(`Unexpected error: ${error}`, { cause: error });
    }

    const { response } = error as HttpClientError<WorkOSResponseError>;

    if (response) {
      const { status, data, headers } = response;

      const requestID = headers.get('X-Request-ID') ?? '';
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
          throw new ConflictException({ requestID, message, error, code });
        }
        case 422: {
          throw new UnprocessableEntityException({
            code,
            error,
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
          if (isAuthenticationErrorData(data)) {
            throw new AuthenticationException(status, data, requestID);
          } else if (error || errorDescription) {
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
