// @oagen-ignore-file
import {
  HttpClientInterface,
  HttpClientResponseInterface,
  RequestHeaders,
  RequestOptions,
  ResponseHeaders,
} from '../interfaces/http-client.interface';
import {
  HttpClient,
  HttpClientError,
  HttpClientOptions,
  HttpClientResponse,
} from './http-client';
import { ParseError } from '../exceptions/parse-error';

type FetchHttpClientOptions = HttpClientOptions;

const DEFAULT_FETCH_TIMEOUT = 60_000; // 60 seconds

/**
 * Deadline for one request attempt, from the initial `fetch()` through to
 * the last byte of the response body.
 */
interface RequestTimeout {
  /**
   * Run one step of the attempt (the `fetch()` itself or a body read) under
   * the deadline. A step interrupted by the deadline, or started after it has
   * passed, rejects with the SDK's 408 `HttpClientError`; any other failure
   * propagates unchanged, including an `AbortError` raised for some other
   * reason while the deadline is still running. Pass the response `headers`
   * once they are known so the request ID and `Retry-After` survive the
   * translation. `abortIsTimeout` keeps the pre-existing request-path
   * behaviour of treating any `AbortError` as the timeout.
   */
  guard<T>(operation: () => Promise<T>, options?: GuardOptions): Promise<T>;
  /** Disarm the deadline. Idempotent. */
  release(): void;
  /**
   * Stop the armed deadline from keeping the process alive on its own while
   * no SDK read is awaiting it. `guard()` references it again.
   */
  unref(): void;
}

/**
 * The deadline armed by `fetchRequest()` alongside the attempt's
 * `AbortController`.
 *
 * It is disarmed when the body has been consumed or the attempt has failed,
 * not when the headers arrive, so a server that responds promptly and then
 * stalls the body still trips the configured timeout (GH-1679). Ownership
 * follows the body: `fetchRequest()` keeps it while reading error bodies and
 * hands it to `FetchHttpClientResponse` for successful responses. A body
 * nobody reads through the SDK (raw access, a discarded delete response, a
 * non-JSON response) keeps the original deadline as a bounded fallback: when
 * it fires the attempt's controller is aborted and the timer is gone.
 */
class AttemptTimeout implements RequestTimeout {
  private handle: ReturnType<typeof setTimeout> | null;
  private expired = false;

  constructor(
    controller: AbortController,
    private readonly timeoutMs: number,
  ) {
    this.handle = setTimeout(() => {
      this.handle = null;
      this.expired = true;
      controller.abort();
    }, timeoutMs);
  }

  async guard<T>(
    operation: () => Promise<T>,
    { headers, abortIsTimeout = false }: GuardOptions = {},
  ): Promise<T> {
    if (this.expired) {
      throw this.timeoutError(headers);
    }

    this.setRef(true);

    try {
      return await operation();
    } catch (error) {
      // The deadline's own expiry is the timeout signal. A caller-supplied
      // fetch can abort for reasons of its own; on the successful-body path
      // that failure is theirs and passes through unchanged.
      if (
        this.expired ||
        (abortIsTimeout && AttemptTimeout.isAbortError(error))
      ) {
        throw this.timeoutError(headers);
      }
      throw error;
    }
  }

  release(): void {
    if (this.handle !== null) {
      clearTimeout(this.handle);
      this.handle = null;
    }
  }

  unref(): void {
    this.setRef(false);
  }

  private setRef(referenced: boolean): void {
    // Node timers can be unreferenced; browser and worker runtimes hand back
    // a number, which has nothing to toggle.
    const handle = this.handle as {
      ref?: () => void;
      unref?: () => void;
    } | null;

    if (referenced) {
      handle?.ref?.();
    } else {
      handle?.unref?.();
    }
  }

  private timeoutError(headers?: Headers): HttpClientError<{ error: string }> {
    return new HttpClientError({
      message: `Request timeout after ${this.timeoutMs}ms`,
      response: {
        status: 408,
        headers: headers ?? new Headers(),
        data: { error: 'Request timeout' },
      },
    });
  }

  private static isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
  }
}

type GuardOptions = {
  headers?: Headers;
  abortIsTimeout?: boolean;
};

/** For responses constructed outside a request attempt. */
const NO_TIMEOUT: RequestTimeout = {
  guard: (operation) => operation(),
  release: () => undefined,
  unref: () => undefined,
};

export class FetchHttpClient extends HttpClient implements HttpClientInterface {
  private readonly _fetchFn;

  constructor(
    readonly baseURL: string,
    readonly options?: FetchHttpClientOptions,
    fetchFn?: typeof fetch,
  ) {
    super(baseURL, options);

    // Default to global fetch if available
    if (!fetchFn) {
      if (!globalThis.fetch) {
        throw new Error(
          'Fetch function not defined in the global scope and no replacement was provided.',
        );
      }
      fetchFn = globalThis.fetch;
    }

    this._fetchFn = fetchFn.bind(globalThis);
  }

  async get(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    return await this.fetchRequestWithRetry(
      resourceURL,
      'GET',
      null,
      options.headers,
      options.maxRetries,
    );
  }

  async post<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    return await this.fetchRequestWithRetry(
      resourceURL,
      'POST',
      HttpClient.getBody(entity),
      {
        ...HttpClient.getContentTypeHeader(entity),
        ...options.headers,
      },
      options.maxRetries,
    );
  }

  async put<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    return await this.fetchRequestWithRetry(
      resourceURL,
      'PUT',
      HttpClient.getBody(entity),
      {
        ...HttpClient.getContentTypeHeader(entity),
        ...options.headers,
      },
      options.maxRetries,
    );
  }

  async patch<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    return await this.fetchRequestWithRetry(
      resourceURL,
      'PATCH',
      HttpClient.getBody(entity),
      {
        ...HttpClient.getContentTypeHeader(entity),
        ...options.headers,
      },
      options.maxRetries,
    );
  }

  async delete(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    return await this.fetchRequestWithRetry(
      resourceURL,
      'DELETE',
      null,
      options.headers,
      options.maxRetries,
    );
  }

  async deleteWithBody<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    return await this.fetchRequestWithRetry(
      resourceURL,
      'DELETE',
      HttpClient.getBody(entity),
      {
        ...HttpClient.getContentTypeHeader(entity),
        ...options.headers,
      },
      options.maxRetries,
    );
  }

  private async fetchRequest(
    url: string,
    method: string,
    body?: any,
    headers?: RequestHeaders,
  ): Promise<HttpClientResponseInterface> {
    // For methods which expect payloads, we should always pass a body value
    // even when it is empty. Without this, some JS runtimes (eg. Deno) will
    // inject a second Content-Length header.
    const methodHasPayload =
      method === 'POST' || method === 'PUT' || method === 'PATCH';

    const requestBody = body || (methodHasPayload ? '' : undefined);

    const { 'User-Agent': userAgent } = (this.options?.headers ||
      {}) as RequestHeaders;

    // Access timeout from the options with default of 60 seconds
    const timeout = this.options?.timeout ?? DEFAULT_FETCH_TIMEOUT; // Default 60 seconds
    const abortController = new AbortController();
    // Armed for the whole attempt, body included; see AttemptTimeout.
    const requestTimeout = new AttemptTimeout(abortController, timeout);

    try {
      // As before this deadline covered the body, an AbortError from the
      // request itself or from an error-body read is reported as a timeout.
      const res = await requestTimeout.guard(
        () =>
          this._fetchFn(url, {
            method,
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
              ...this.options?.headers,
              ...headers,
              'User-Agent': (userAgent || 'workos-node').toString(),
            },
            body: requestBody,
            signal: abortController.signal,
          }),
        { abortIsTimeout: true },
      );

      if (!res.ok) {
        const requestID = res.headers.get('X-Request-ID') ?? '';

        // Read the error body under the same deadline: a stalled error
        // response surfaces as a 408 here, inside the attempt, where the
        // retry policy already handles it.
        let rawBody: string;

        try {
          rawBody = await requestTimeout.guard(() => res.text(), {
            headers: res.headers,
            abortIsTimeout: true,
          });
        } finally {
          requestTimeout.release();
        }

        let responseJson: any;

        try {
          responseJson = JSON.parse(rawBody);
        } catch (error) {
          if (error instanceof SyntaxError) {
            throw new ParseError({
              message: error.message,
              rawBody,
              requestID,
              rawStatus: res.status,
              rawHeaders: res.headers,
            });
          }
          throw error;
        }

        throw new HttpClientError({
          message: res.statusText,
          response: {
            status: res.status,
            headers: res.headers,
            data: responseJson,
          },
        });
      }
      // The body is still on the wire: the deadline goes with the response.
      return new FetchHttpClientResponse(res, requestTimeout);
    } catch (error) {
      // Nothing took ownership of the deadline, so disarm it. Timeouts have
      // already been translated to a 408 HttpClientError by guard().
      requestTimeout.release();

      throw error;
    }
  }

  private async fetchRequestWithRetry(
    url: string,
    method: string,
    body?: any,
    headers?: RequestHeaders,
    maxRetries?: number,
  ): Promise<HttpClientResponseInterface> {
    const maxRetryAttempts = maxRetries ?? this.MAX_RETRY_ATTEMPTS;

    // Attach an idempotency key to retryable POST requests that don't have
    // one so retried calls are not applied more than once by the API.
    // POST-only to match the Kotlin and Go SDKs and the API, which honors
    // `Idempotency-Key` on create (POST) endpoints. Generated once so every
    // attempt shares the same key.
    const requestHeaders = FetchHttpClient.withIdempotencyKey(
      method,
      headers,
      maxRetryAttempts,
    );

    let response: HttpClientResponseInterface;
    let retryAttempts = 1;

    const makeRequest = async (): Promise<HttpClientResponseInterface> => {
      let requestError: any = null;

      try {
        response = await this.fetchRequest(url, method, body, requestHeaders);
      } catch (e) {
        requestError = e;
      }

      if (
        this.shouldRetryRequest(requestError, retryAttempts, maxRetryAttempts)
      ) {
        retryAttempts++;
        await this.sleep(
          retryAttempts,
          FetchHttpClient.getRetryAfterMs(requestError),
        );
        return makeRequest();
      }

      if (requestError != null) {
        throw requestError;
      }

      return response;
    };

    return makeRequest();
  }

  private shouldRetryRequest(
    requestError: any,
    retryAttempt: number,
    maxRetryAttempts: number,
  ): boolean {
    if (retryAttempt > maxRetryAttempts) {
      return false;
    }

    if (requestError != null) {
      if (requestError instanceof TypeError) {
        return true;
      }

      if (
        requestError instanceof HttpClientError &&
        this.RETRY_STATUS_CODES.includes(requestError.response.status)
      ) {
        return true;
      }

      // A retryable status can arrive with a non-JSON body (e.g. an HTML error
      // page from a proxy), which `fetchRequest` surfaces as a `ParseError`.
      // Retry those based on the underlying status.
      if (
        requestError instanceof ParseError &&
        this.RETRY_STATUS_CODES.includes(requestError.rawStatus)
      ) {
        return true;
      }
    }

    return false;
  }

  private static withIdempotencyKey(
    method: string,
    headers: RequestHeaders | undefined,
    maxRetryAttempts: number,
  ): RequestHeaders | undefined {
    if (
      method !== 'POST' ||
      maxRetryAttempts <= 0 ||
      FetchHttpClient.hasHeader(headers, 'Idempotency-Key')
    ) {
      return headers;
    }

    return {
      ...headers,
      'Idempotency-Key': HttpClient.generateIdempotencyKey(),
    };
  }

  private static hasHeader(
    headers: RequestHeaders | undefined,
    name: string,
  ): boolean {
    if (!headers) {
      return false;
    }

    const target = name.toLowerCase();
    return Object.keys(headers).some((key) => key.toLowerCase() === target);
  }

  private static getRetryAfterMs(requestError: any): number | null {
    let headers: any;

    if (requestError instanceof HttpClientError) {
      headers = requestError.response?.headers;
    } else if (requestError instanceof ParseError) {
      headers = requestError.rawHeaders;
    } else {
      return null;
    }

    let value: string | null | undefined;

    if (headers && typeof headers.get === 'function') {
      value = headers.get('Retry-After');
    } else if (headers && typeof headers === 'object') {
      value = headers['Retry-After'] ?? headers['retry-after'];
    }

    return HttpClient.parseRetryAfter(value);
  }
}

// tslint:disable-next-line
export class FetchHttpClientResponse
  extends HttpClientResponse
  implements HttpClientResponseInterface
{
  _res: Response;
  private readonly _requestTimeout: RequestTimeout;

  constructor(res: Response, requestTimeout: RequestTimeout = NO_TIMEOUT) {
    super(
      res.status,
      FetchHttpClientResponse._transformHeadersToObject(res.headers),
    );
    this._res = res;
    this._requestTimeout = requestTimeout;

    if (res.body === null) {
      // Nothing left to wait for.
      requestTimeout.release();
    } else {
      // Until toJSON() reads the body, or for good if nobody does (raw
      // access, a discarded delete response, a non-JSON response), the
      // deadline stays armed as a bounded fallback but must not keep the
      // process alive by itself.
      requestTimeout.unref();
    }
  }

  getRawResponse(): Response {
    return this._res;
  }

  async toJSON(): Promise<any | null> {
    const contentType = this._res.headers.get('content-type');
    const isJsonResponse = contentType?.includes('application/json');

    if (!isJsonResponse) {
      return null;
    }

    let rawBody: string;

    if (this._res.bodyUsed || this._res.body?.locked) {
      // Someone else already holds the body: an earlier toJSON() or a raw
      // consumer. Their read keeps the deadline; this call only surfaces
      // the response's own rejection for a body that is already in use.
      rawBody = await this._res.text();
    } else {
      // This call owns the read. Only the read runs under the deadline: an
      // interrupted body is a timeout, a complete but malformed one is still
      // a ParseError below.
      try {
        rawBody = await this._requestTimeout.guard(() => this._res.text(), {
          headers: this._res.headers,
        });
      } finally {
        this._requestTimeout.release();
      }
    }

    try {
      return JSON.parse(rawBody);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new ParseError({
          message: error.message,
          rawBody,
          rawStatus: this._res.status,
          requestID: this._res.headers.get('X-Request-ID') ?? '',
        });
      }
      throw error;
    }
  }

  static _transformHeadersToObject(headers: Headers): ResponseHeaders {
    // Fetch uses a Headers instance so this must be converted to a barebones
    // JS object to meet the HttpClient interface.
    const headersObj: ResponseHeaders = {};
    for (const entry of Object.entries(headers)) {
      if (!Array.isArray(entry) || entry.length !== 2) {
        throw new Error(
          'Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.',
        );
      }

      headersObj[entry[0]] = entry[1];
    }

    return headersObj;
  }
}
