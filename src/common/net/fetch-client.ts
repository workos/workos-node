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
    const timeoutId = setTimeout(() => {
      abortController?.abort();
    }, timeout);

    try {
      const res = await this._fetchFn(url, {
        method,
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          ...this.options?.headers,
          ...headers,
          'User-Agent': (userAgent || 'workos-node').toString(),
        },
        body: requestBody,
        signal: abortController?.signal,
      });

      // Clear timeout if request completed successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!res.ok) {
        const requestID = res.headers.get('X-Request-ID') ?? '';
        const rawBody = await res.text();

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
      return new FetchHttpClientResponse(res);
    } catch (error) {
      // Clear timeout if request failed
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpClientError({
          message: `Request timeout after ${timeout}ms`,
          response: {
            status: 408,
            headers: {},
            data: { error: 'Request timeout' },
          },
        });
      }

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

    // Attach an idempotency key to retryable write requests that don't have
    // one so retried POST/PUT/PATCH calls are not applied more than once by
    // the API. Generated once so every attempt shares the same key.
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
    const isWriteMethod =
      method === 'POST' || method === 'PUT' || method === 'PATCH';

    if (
      !isWriteMethod ||
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

  constructor(res: Response) {
    super(
      res.status,
      FetchHttpClientResponse._transformHeadersToObject(res.headers),
    );
    this._res = res;
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

    const rawBody = await this._res.text();

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
