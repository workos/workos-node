import {
  HttpClientInterface,
  HttpClientResponseInterface,
  RequestHeaders,
  RequestOptions,
  ResponseHeaders,
} from '../interfaces/http-client.interface';
import { HttpClient, HttpClientError, HttpClientResponse } from './http-client';
import { ParseError } from '../exceptions/parse-error';

interface FetchHttpClientOptions extends RequestInit {
  timeout?: number;
}

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

  /** @override */
  getClientName(): string {
    return 'fetch';
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

    if (HttpClient.isPathRetryable(path)) {
      return await this.fetchRequestWithRetry(
        resourceURL,
        'GET',
        null,
        options.headers,
      );
    } else {
      return await this.fetchRequest(resourceURL, 'GET', null, options.headers);
    }
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

    if (HttpClient.isPathRetryable(path)) {
      return await this.fetchRequestWithRetry(
        resourceURL,
        'POST',
        HttpClient.getBody(entity),
        {
          ...HttpClient.getContentTypeHeader(entity),
          ...options.headers,
        },
      );
    } else {
      return await this.fetchRequest(
        resourceURL,
        'POST',
        HttpClient.getBody(entity),
        {
          ...HttpClient.getContentTypeHeader(entity),
          ...options.headers,
        },
      );
    }
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

    if (HttpClient.isPathRetryable(path)) {
      return await this.fetchRequestWithRetry(
        resourceURL,
        'PUT',
        HttpClient.getBody(entity),
        {
          ...HttpClient.getContentTypeHeader(entity),
          ...options.headers,
        },
      );
    } else {
      return await this.fetchRequest(
        resourceURL,
        'PUT',
        HttpClient.getBody(entity),
        {
          ...HttpClient.getContentTypeHeader(entity),
          ...options.headers,
        },
      );
    }
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

    if (HttpClient.isPathRetryable(path)) {
      return await this.fetchRequestWithRetry(
        resourceURL,
        'DELETE',
        null,
        options.headers,
      );
    } else {
      return await this.fetchRequest(
        resourceURL,
        'DELETE',
        null,
        options.headers,
      );
    }
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
          'User-Agent': this.addClientToUserAgent(
            (userAgent || 'workos-node').toString(),
          ),
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
  ): Promise<HttpClientResponseInterface> {
    let response: HttpClientResponseInterface;
    let retryAttempts = 1;

    const makeRequest = async (): Promise<HttpClientResponseInterface> => {
      let requestError: any = null;

      try {
        response = await this.fetchRequest(url, method, body, headers);
      } catch (e) {
        requestError = e;
      }

      if (this.shouldRetryRequest(requestError, retryAttempts)) {
        retryAttempts++;
        await this.sleep(retryAttempts);
        return makeRequest();
      }

      if (requestError != null) {
        throw requestError;
      }

      return response;
    };

    return makeRequest();
  }

  private shouldRetryRequest(requestError: any, retryAttempt: number): boolean {
    if (retryAttempt > this.MAX_RETRY_ATTEMPTS) {
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
    }

    return false;
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

  toJSON(): Promise<any> | null {
    const contentType = this._res.headers.get('content-type');
    const isJsonResponse = contentType?.includes('application/json');

    return isJsonResponse ? this._res.json() : null;
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
