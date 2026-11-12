import { GenericServerException } from '../common/exceptions/generic-server.exception';
import { OauthException } from '../common/exceptions/oauth.exception';
import { WorkloadIdentityOptions } from '../common/interfaces/workload-identity-options.interface';

const GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const RESOURCE = 'https://api.workos.com';
const HEADER_ENVIRONMENT_ID = 'x-url-environment-id';
const DEFAULT_TIMEOUT_IN_MILLISECONDS = 60_000;
const REDACTED = '[REDACTED]';

/**
 * How long before expiry a token is replaced. Capped at half the token's
 * lifetime so a very short-lived token is still reused.
 */
export const WORKLOAD_IDENTITY_REFRESH_MARGIN_IN_SECONDS = 30;

interface CachedToken {
  accessToken: string;
  /** Epoch milliseconds after which the token is replaced; null when the server gave no lifetime. */
  refreshAt: number | null;
}

export interface WorkloadIdentityTokenProviderConfig {
  fetchFn?: typeof fetch;
  /** Timeout of one exchange in milliseconds. */
  timeout?: number;
  userAgent?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
  );
}

/**
 * Exchanges a workload's ID token for a WorkOS API access token (RFC 7523
 * `jwt-bearer`, no client secret) and caches the result in memory.
 *
 * Uses `fetch` only, so it runs in Node and in worker runtimes. Neither the
 * ID token nor the access token is ever placed in an error or logged.
 */
export class WorkloadIdentityTokenProvider {
  private readonly clientId: string;
  private readonly tokenSource: () => Promise<string>;
  private readonly tokenEndpoint: string;
  private readonly environmentId?: string;
  private readonly scope?: string;

  private cached?: CachedToken;
  private inFlight?: Promise<string>;

  constructor(
    options: WorkloadIdentityOptions,
    private readonly config: WorkloadIdentityTokenProviderConfig = {},
  ) {
    if (!options.clientId) {
      throw new TypeError('workloadIdentity.clientId is required.');
    }

    if (typeof options.tokenSource !== 'function') {
      throw new TypeError('workloadIdentity.tokenSource must be a function.');
    }

    let endpoint: URL;
    try {
      endpoint = new URL(options.tokenEndpoint);
    } catch {
      throw new TypeError('workloadIdentity.tokenEndpoint must be a full URL.');
    }

    const isHttps = endpoint.protocol === 'https:';
    const isLocalHttp =
      endpoint.protocol === 'http:' && isLoopbackHostname(endpoint.hostname);
    if (!isHttps && !isLocalHttp) {
      throw new TypeError('workloadIdentity.tokenEndpoint must use https.');
    }

    const scope = Array.isArray(options.scope)
      ? options.scope.join(' ')
      : options.scope;

    this.clientId = options.clientId;
    this.tokenSource = options.tokenSource;
    this.tokenEndpoint = endpoint.toString();
    this.environmentId = options.environmentId;
    this.scope = scope || undefined;
  }

  /**
   * Returns a usable access token, exchanging first when there is none or the
   * cached one is about to expire. Concurrent callers share one exchange.
   */
  getAccessToken(): Promise<string> {
    const cached = this.cached;
    if (
      cached &&
      (cached.refreshAt === null || Date.now() < cached.refreshAt)
    ) {
      return Promise.resolve(cached.accessToken);
    }

    if (!this.inFlight) {
      this.inFlight = this.exchange().finally(() => {
        this.inFlight = undefined;
      });
    }

    return this.inFlight;
  }

  /**
   * Drops the cached token if it is still the given one, so the next call
   * exchanges again. A token that has already been replaced is left alone,
   * which keeps concurrent 401s from triggering more than one exchange.
   */
  invalidate(accessToken: string): void {
    if (this.cached?.accessToken === accessToken) {
      this.cached = undefined;
    }
  }

  /** Headers that authenticate one API request with the given access token. */
  requestHeaders(accessToken: string): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    if (this.environmentId) {
      headers[HEADER_ENVIRONMENT_ID] = this.environmentId;
    }

    return headers;
  }

  private async exchange(): Promise<string> {
    const assertion = await this.tokenSource();
    if (typeof assertion !== 'string' || assertion === '') {
      throw new TypeError(
        'workloadIdentity.tokenSource must resolve to a non-empty string.',
      );
    }

    const form = new URLSearchParams({
      grant_type: GRANT_TYPE,
      assertion,
      client_id: this.clientId,
      resource: RESOURCE,
    });
    if (this.scope) {
      form.set('scope', this.scope);
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    if (this.config.userAgent) {
      headers['User-Agent'] = this.config.userAgent;
    }

    const fetchFn = this.config.fetchFn ?? globalThis.fetch;
    if (!fetchFn) {
      throw new Error(
        'Fetch function not defined in the global scope and no replacement was provided.',
      );
    }

    const timeout = this.config.timeout ?? DEFAULT_TIMEOUT_IN_MILLISECONDS;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    let status: number;
    let ok: boolean;
    let requestID: string;
    let rawBody: string;

    try {
      const response = await fetchFn.call(globalThis, this.tokenEndpoint, {
        method: 'POST',
        headers,
        body: form.toString(),
        signal: abortController.signal,
      });
      status = response.status;
      ok = response.ok;
      requestID = response.headers.get('X-Request-ID') ?? '';
      rawBody = await response.text();
    } catch (error) {
      // Neither error below carries the caught one as `cause`: a transport is
      // free to put the request, ID token included, on what it throws.
      if (abortController.signal.aborted) {
        // eslint-disable-next-line preserve-caught-error -- see above
        throw new Error(
          `Workload identity token exchange timed out after ${timeout}ms.`,
        );
      }

      const reason = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line preserve-caught-error -- see above
      throw new Error(
        `Workload identity token exchange failed: ${this.redact(reason, assertion)}`,
      );
    } finally {
      clearTimeout(timeoutId);
    }

    let data: unknown;
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = undefined;
    }

    if (!ok) {
      throw this.toExchangeError(status, requestID, data, assertion);
    }

    if (
      !isRecord(data) ||
      typeof data.access_token !== 'string' ||
      data.access_token === ''
    ) {
      throw new Error(
        'Workload identity token exchange failed: the token endpoint response had no access_token.',
      );
    }

    if (
      typeof data.token_type !== 'string' ||
      data.token_type.toLowerCase() !== 'bearer'
    ) {
      throw new Error(
        'Workload identity token exchange failed: the token endpoint did not return a Bearer token.',
      );
    }

    const accessToken = data.access_token;
    const expiresIn =
      typeof data.expires_in === 'number' &&
      Number.isFinite(data.expires_in) &&
      data.expires_in > 0
        ? data.expires_in
        : null;

    this.cached = {
      accessToken,
      refreshAt:
        expiresIn === null
          ? null
          : Date.now() +
            (expiresIn -
              Math.min(
                WORKLOAD_IDENTITY_REFRESH_MARGIN_IN_SECONDS,
                expiresIn / 2,
              )) *
              1000,
    };

    return accessToken;
  }

  private toExchangeError(
    status: number,
    requestID: string,
    data: unknown,
    assertion: string,
  ): Error {
    const error =
      isRecord(data) && typeof data.error === 'string'
        ? this.redact(data.error, assertion)
        : undefined;
    const errorDescription =
      isRecord(data) && typeof data.error_description === 'string'
        ? this.redact(data.error_description, assertion)
        : undefined;

    if (error) {
      // Only the two OAuth fields are kept as raw data: the rest of the body
      // is not part of the contract and is not worth the risk of an echo.
      return new OauthException(status, requestID, error, errorDescription, {
        error,
        ...(errorDescription !== undefined && {
          error_description: errorDescription,
        }),
      });
    }

    return new GenericServerException(
      status,
      `Workload identity token exchange failed with status ${status}.`,
      {},
      requestID,
    );
  }

  private redact(text: string, assertion: string): string {
    return text.split(assertion).join(REDACTED);
  }
}
