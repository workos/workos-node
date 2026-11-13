// @oagen-ignore-file
import { version as VERSION } from '../../package.json' with { type: 'json' };
import { ParseError } from '../common/exceptions/parse-error';
import type { HttpClientResponseInterface } from '../common/interfaces/http-client.interface';
import type {
  CredentialContext,
  Credentials,
  CredentialSnapshot,
} from '../common/net/credentials';
import { FetchHttpClient } from '../common/net/fetch-client';
import {
  DEFAULT_MAX_RETRY_ATTEMPTS,
  HttpClient,
  HttpClientError,
} from '../common/net/http-client';
import { getEnv } from '../common/utils/env';
import {
  DEFAULT_RESOURCE,
  DEFAULT_TOKEN_LIFETIME_SECONDS,
  ENVIRONMENT_ID_HEADER,
  EXCHANGE_DEADLINE_MS,
  JWT_BEARER_GRANT_TYPE,
  REFRESH_THRESHOLD_LIFETIME_FRACTION,
  REFRESH_THRESHOLD_MAX_MS,
} from './constants';
import { WorkloadIdentityError } from './workload-identity-error';

/**
 * Returns the workload's identity token, a JWT issued by the platform the
 * workload runs on. It is called again for every exchange attempt, so it
 * should hold no cache of its own and must never log the token.
 */
export type IdentityTokenProvider = () => Promise<string>;

export interface WorkloadIdentityCredentialsOptions {
  /** The M2M application's client ID. Defaults to `WORKOS_CLIENT_ID`. */
  clientId?: string;
  /**
   * The token exchange endpoint. Defaults to `WORKOS_WIF_TOKEN_URL`. There is
   * no built-in default.
   */
  tokenUrl?: string;
  /**
   * Optional. Defaults to `WORKOS_ENVIRONMENT_ID`, else not set.
   *
   * The server binds a workload identity client to exactly one environment,
   * so this selects nothing. Setting it is a safety check: it is sent as the
   * `x-url-environment-id` header on every API request, and a value that
   * names a different environment gets `403 environment_mismatch`. When it is
   * not set, the header is not sent. An empty string counts as not set.
   */
  environmentId?: string;
  /** The API the access token is for. Defaults to `https://api.workos.com`. */
  resource?: string;
  /** The scope to request. Defaults to `WORKOS_WIF_SCOPE`, else no scope. */
  scope?: string;
  /** Returns the workload's identity token. */
  identityTokenProvider: IdentityTokenProvider;
}

/**
 * Test seams. Not part of the public API.
 *
 * @internal
 */
export interface WorkloadIdentityInternals {
  /** The clock the token cache reads, in milliseconds. */
  now?: () => number;
  /** Waits before an exchange retry. Same contract as `HttpClient#sleep`. */
  sleep?: (
    retryAttempt: number,
    retryAfterMs?: number | null,
  ) => Promise<unknown>;
}

interface CachedToken {
  token: string;
  generation: number;
  lifetimeMs: number;
  expiresAt: number;
}

interface IssuedToken {
  token: string;
  generation: number;
}

interface TokenResponse {
  accessToken: string;
  expiresInSeconds: number;
}

/** One exchange POST: either an HTTP response or no response at all. */
type ExchangeAttempt =
  | {
      responded: true;
      status: number;
      body: unknown;
      retryAfterMs: number | null;
    }
  | { responded: false; error: unknown };

/**
 * Authorizes API requests with a short-lived WorkOS access token, obtained by
 * exchanging the workload's identity token. No API key is stored or sent.
 *
 * The token is cached on this instance and replaced on demand shortly before
 * it expires. Concurrent requests share one exchange.
 *
 * @example
 * const workos = new WorkOS({
 *   credentials: new WorkloadIdentityCredentials({
 *     clientId: 'client_123',
 *     tokenUrl: 'https://auth.example.com/oauth2/token',
 *     environmentId: 'environment_123',
 *     identityTokenProvider: async () => fetchMyPlatformJwt(),
 *   }),
 * });
 */
export class WorkloadIdentityCredentials implements Credentials {
  private readonly clientId: string;
  private readonly tokenUrl: URL;
  private readonly environmentId: string | undefined;
  private readonly resource: string;
  private readonly scope: string | undefined;
  private readonly identityTokenProvider: IdentityTokenProvider;
  private readonly now: () => number;
  private readonly sleep: NonNullable<WorkloadIdentityInternals['sleep']>;

  // Held by this instance only: two instances never share a token or an
  // exchange, even with identical configuration.
  private cache: CachedToken | undefined;
  private inflight: Promise<IssuedToken> | undefined;

  /**
   * @param options - Omitted fields default from the environment; an explicit
   * value always wins.
   * @param internals - Test seams. Not part of the public API.
   * @throws {WorkloadIdentityError} `invalid_configuration` when a required
   * setting is missing after the environment is consulted.
   */
  constructor(
    options: WorkloadIdentityCredentialsOptions,
    /** @internal */
    internals: WorkloadIdentityInternals = {},
  ) {
    const clientId = options?.clientId || getEnv('WORKOS_CLIENT_ID');
    const tokenUrl = options?.tokenUrl || getEnv('WORKOS_WIF_TOKEN_URL');

    if (!clientId) {
      throw missingSetting('clientId', 'WORKOS_CLIENT_ID');
    }
    if (!tokenUrl) {
      throw missingSetting('tokenUrl', 'WORKOS_WIF_TOKEN_URL');
    }
    if (typeof options?.identityTokenProvider !== 'function') {
      throw new WorkloadIdentityError(
        'invalid_configuration',
        'identityTokenProvider is required',
      );
    }

    try {
      this.tokenUrl = new URL(tokenUrl);
    } catch {
      throw new WorkloadIdentityError(
        'invalid_configuration',
        'tokenUrl is not a valid URL',
      );
    }

    if (
      this.tokenUrl.protocol !== 'https:' &&
      this.tokenUrl.protocol !== 'http:'
    ) {
      throw new WorkloadIdentityError(
        'invalid_configuration',
        'tokenUrl must be an http or https URL',
      );
    }

    this.clientId = clientId;
    // Optional: an empty string counts as not set.
    this.environmentId =
      options.environmentId || getEnv('WORKOS_ENVIRONMENT_ID') || undefined;
    this.resource = options.resource || DEFAULT_RESOURCE;
    this.scope = options.scope || getEnv('WORKOS_WIF_SCOPE') || undefined;
    this.identityTokenProvider = options.identityTokenProvider;
    this.now = internals.now ?? (() => Date.now());
    this.sleep =
      internals.sleep ??
      // The SDK's own backoff, so the exchange waits exactly as API requests do.
      ((retryAttempt, retryAfterMs) =>
        this.createExchangeClient(EXCHANGE_DEADLINE_MS).sleep(
          retryAttempt,
          retryAfterMs,
        ));
  }

  /**
   * Returns the headers for one API attempt, exchanging for a new access
   * token first when the cached one is missing or about to expire.
   *
   * @throws {WorkloadIdentityError} When the exchange fails.
   */
  async resolve(context: CredentialContext = {}): Promise<CredentialSnapshot> {
    const { token, generation } = await this.currentToken(context.signal);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (this.environmentId) {
      headers[ENVIRONMENT_ID_HEADER] = this.environmentId;
    }

    return {
      headers,
      generation,
      recoverable: true,
    };
  }

  /**
   * Discards the cached token, but only if it is still the one `generation`
   * names. A late 401 for an old token leaves a newer token in place.
   */
  invalidate(generation: number): void {
    if (this.cache?.generation === generation) {
      this.cache.expiresAt = Number.NEGATIVE_INFINITY;
    }
  }

  private currentToken(signal?: AbortSignal): Promise<IssuedToken> {
    const cache = this.cache;

    if (cache && this.isFresh(cache)) {
      return Promise.resolve({
        token: cache.token,
        generation: cache.generation,
      });
    }

    this.inflight ??= this.startExchange();

    // The caller holds its own reference to the exchange it joined. Giving up
    // stops this caller from waiting and leaves the exchange running.
    return settleUnlessAborted(this.inflight, signal, () =>
      abortReason(signal),
    );
  }

  private isFresh(cache: CachedToken): boolean {
    const threshold = Math.min(
      REFRESH_THRESHOLD_MAX_MS,
      REFRESH_THRESHOLD_LIFETIME_FRACTION * cache.lifetimeMs,
    );

    return cache.expiresAt - this.now() >= threshold;
  }

  /**
   * Starts the one shared exchange. It runs on its own deadline, tied to no
   * caller. The in-flight reference is cleared before any waiter is woken, so
   * a caller that gets an error and calls again starts a new exchange.
   */
  private startExchange(): Promise<IssuedToken> {
    const exchange = Promise.resolve()
      .then(() => this.exchangeWithinDeadline())
      .then(
        ({ accessToken, expiresInSeconds }) => {
          const lifetimeMs = expiresInSeconds * 1000;
          const generation = (this.cache?.generation ?? 0) + 1;

          this.cache = {
            token: accessToken,
            generation,
            lifetimeMs,
            expiresAt: this.now() + lifetimeMs,
          };
          this.inflight = undefined;

          return { token: accessToken, generation };
        },
        (error) => {
          // A failed exchange is not cached.
          this.inflight = undefined;
          throw error;
        },
      );

    // Every waiter may have given up by the time this settles.
    exchange.catch(() => undefined);

    return exchange;
  }

  private async exchangeWithinDeadline(): Promise<TokenResponse> {
    const deadline = new AbortController();
    const timer = setTimeout(() => deadline.abort(), EXCHANGE_DEADLINE_MS);

    try {
      return await this.exchange(
        deadline.signal,
        Date.now() + EXCHANGE_DEADLINE_MS,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * The jwt-bearer exchange. Retries when the provider fails, when no
   * response arrives, and on 429 and 5xx. The provider is called again and
   * the form rebuilt on every attempt. Any other response is final.
   */
  private async exchange(
    deadline: AbortSignal,
    deadlineAt: number,
  ): Promise<TokenResponse> {
    const pastDeadline = () =>
      new WorkloadIdentityError(
        'exchange_failed',
        `The token exchange did not finish within ${EXCHANGE_DEADLINE_MS / 1000} seconds.`,
      );

    let failure = new WorkloadIdentityError('exchange_failed');
    let retryAfterMs: number | null = null;

    for (let attempt = 0; attempt <= DEFAULT_MAX_RETRY_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        // Numbered as the SDK's request loop numbers its retries. A wait the
        // server asked for never runs past the deadline.
        await settleUnlessAborted(
          this.sleep(
            attempt + 1,
            retryAfterMs === null
              ? null
              : Math.min(retryAfterMs, Math.max(0, deadlineAt - Date.now())),
          ),
          deadline,
          pastDeadline,
        );
        retryAfterMs = null;
      }

      let assertion: string;

      try {
        assertion = await settleUnlessAborted(
          Promise.resolve().then(() => this.identityTokenProvider()),
          deadline,
          pastDeadline,
        );
      } catch (error) {
        if (deadline.aborted) {
          throw pastDeadline();
        }

        failure = new WorkloadIdentityError(
          'provider_failed',
          error instanceof Error ? error.message : '',
          { cause: error },
        );
        continue;
      }

      if (typeof assertion !== 'string' || assertion.trim() === '') {
        failure = new WorkloadIdentityError(
          'provider_failed',
          'The identity token provider returned an empty token.',
        );
        continue;
      }

      const form = new URLSearchParams({
        grant_type: JWT_BEARER_GRANT_TYPE,
        assertion,
        client_id: this.clientId,
        resource: this.resource,
      });
      if (this.scope) {
        form.set('scope', this.scope);
      }

      const result = await settleUnlessAborted(
        this.post(form, Math.max(1, deadlineAt - Date.now())),
        deadline,
        pastDeadline,
      );

      if (!result.responded) {
        failure = new WorkloadIdentityError(
          'exchange_failed',
          'The token request did not get a response.',
          { cause: result.error },
        );
        continue;
      }

      const { status, body } = result;
      const oauthError = readOAuthError(body);

      // The status is checked before the body: a 429 or 5xx is retried even
      // when it carries an OAuth error.
      if (status === 429 || (status >= 500 && status <= 599)) {
        retryAfterMs = result.retryAfterMs;
        failure = new WorkloadIdentityError(
          oauthError?.code ?? 'exchange_failed',
          oauthError?.description ??
            `The token endpoint responded with status ${status}.`,
        );
        continue;
      }

      if (oauthError) {
        throw new WorkloadIdentityError(
          oauthError.code,
          oauthError.description,
        );
      }

      // Status 0 is how a browser-like runtime reports an unfollowed redirect.
      if (status === 0 || (status >= 300 && status <= 399)) {
        throw new WorkloadIdentityError(
          'exchange_failed',
          'The token endpoint responded with a redirect. Redirects are not followed.',
        );
      }

      if (status !== 200) {
        throw new WorkloadIdentityError(
          'invalid_response',
          `The token endpoint responded with status ${status}.`,
        );
      }

      return readTokenResponse(body);
    }

    throw failure;
  }

  /**
   * Sends one exchange POST and reports what came back. Never rejects, and
   * never keeps a response body that could hold a token: only the status, the
   * parsed JSON and `Retry-After` leave this method.
   */
  private async post(
    form: URLSearchParams,
    timeout: number,
  ): Promise<ExchangeAttempt> {
    try {
      // The absolute URL, never a path joined to the origin: a path that
      // starts with `//` would be read as another host.
      const response = await this.createExchangeClient(timeout).post(
        this.tokenUrl.href,
        form,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        responded: true,
        status: response.getStatusCode(),
        body: await readJson(response),
        retryAfterMs: null,
      };
    } catch (error) {
      if (error instanceof HttpClientError) {
        if (isRequestTimeout(error)) {
          return { responded: false, error };
        }

        return {
          responded: true,
          status: error.response.status,
          body: error.response.data,
          retryAfterMs: HttpClient.parseRetryAfter(
            error.response.headers?.get('Retry-After'),
          ),
        };
      }

      // An error response whose body is not JSON.
      if (error instanceof ParseError) {
        return {
          responded: true,
          status: error.rawStatus,
          body: undefined,
          retryAfterMs: HttpClient.parseRetryAfter(
            error.rawHeaders?.get('Retry-After'),
          ),
        };
      }

      return { responded: false, error };
    }
  }

  /**
   * The SDK's HTTP client, set up for the exchange: one attempt per call (the
   * exchange loop owns the retries), redirects never followed, and none of
   * the API client's settings. It has no credentials, so the request carries
   * no API key and no `Authorization` header.
   */
  private createExchangeClient(timeout: number): FetchHttpClient {
    return new FetchHttpClient(
      this.tokenUrl.origin,
      {
        timeout,
        maxRetries: 0,
        headers: { 'User-Agent': `workos-node/${VERSION}` },
      },
      undefined,
      { redirect: 'manual' },
    );
  }
}

function missingSetting(field: string, variable: string) {
  return new WorkloadIdentityError(
    'invalid_configuration',
    `${field} is required (or set ${variable})`,
  );
}

/**
 * Settles with `work`, or rejects with `reason()` as soon as `signal` aborts.
 * `work` is left running either way.
 */
function settleUnlessAborted<T>(
  work: Promise<T>,
  signal: AbortSignal | undefined,
  reason: () => unknown,
): Promise<T> {
  if (!signal) {
    return work;
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(reason());

    if (signal.aborted) {
      onAbort();
    } else {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    work.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

function abortReason(signal: AbortSignal | undefined): unknown {
  if (signal?.reason !== undefined) {
    return signal.reason;
  }

  const error = new Error('The operation was aborted.');
  error.name = 'AbortError';
  return error;
}

/**
 * True for the 408 the SDK's HTTP client raises itself when a request runs
 * past its timeout (see `fetch-client.ts`), which is a transport failure. A
 * 408 sent by the server is a response.
 */
function isRequestTimeout(error: HttpClientError<unknown>): boolean {
  const { status, data } = error.response;

  return status === 408 && isRecord(data) && data.error === 'Request timeout';
}

async function readJson(
  response: HttpClientResponseInterface,
): Promise<unknown> {
  try {
    return await response.toJSON();
  } catch (error) {
    if (error instanceof ParseError) {
      return undefined;
    }
    throw error;
  }
}

function readOAuthError(
  body: unknown,
): { code: string; description: string } | undefined {
  if (!isRecord(body) || typeof body.error !== 'string' || !body.error) {
    return undefined;
  }

  return {
    code: body.error,
    description:
      typeof body.error_description === 'string' ? body.error_description : '',
  };
}

function readTokenResponse(body: unknown): TokenResponse {
  if (!isRecord(body)) {
    throw new WorkloadIdentityError(
      'invalid_response',
      'The token response was not a JSON object.',
    );
  }

  const { access_token: accessToken, expires_in: expiresIn } = body;

  if (typeof accessToken !== 'string' || !accessToken) {
    throw new WorkloadIdentityError(
      'invalid_response',
      'The token response had no access token.',
    );
  }

  return {
    accessToken,
    expiresInSeconds:
      typeof expiresIn === 'number' &&
      Number.isFinite(expiresIn) &&
      expiresIn > 0
        ? expiresIn
        : DEFAULT_TOKEN_LIFETIME_SECONDS,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
