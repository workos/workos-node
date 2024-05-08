import {
  HttpClientInterface,
  HttpClientResponseInterface,
  RequestHeaders,
  RequestOptions,
  ResponseHeaders,
} from '../interfaces/http-client.interface';
import { HttpClient, HttpClientError, HttpClientResponse } from './http-client';

export class FetchHttpClient extends HttpClient implements HttpClientInterface {
  private readonly _fetchFn;

  constructor(
    readonly baseURL: string,
    readonly options?: RequestInit,
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

    this._fetchFn = fetchFn;
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

    return await this.fetchRequest(resourceURL, 'GET', null, options.headers);
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

  async delete(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    const resourceURL = HttpClient.getResourceURL(
      this.baseURL,
      path,
      options.params,
    );

    return await this.fetchRequest(
      resourceURL,
      'DELETE',
      null,
      options.headers,
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
      method == 'POST' || method == 'PUT' || method == 'PATCH';

    const requestBody = body || (methodHasPayload ? '' : undefined);

    const { 'User-Agent': userAgent } = this.options?.headers as RequestHeaders;

    const res = await this._fetchFn(url, {
      method,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        ...this.options?.headers,
        ...headers,
        'User-Agent': this.addClientToUserAgent(userAgent.toString()),
      },
      body: requestBody,
    });

    if (!res.ok) {
      throw new HttpClientError({
        message: res.statusText,
        response: {
          status: res.status,
          headers: res.headers,
          data: await res.json(),
        },
      });
    }

    return new FetchHttpClientResponse(res);
  }
}

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

    if (isJsonResponse) {
      return this._res.json();
    }

    return null;
  }

  static _transformHeadersToObject(headers: Headers): ResponseHeaders {
    // Fetch uses a Headers instance so this must be converted to a barebones
    // JS object to meet the HttpClient interface.
    const headersObj: ResponseHeaders = {};
    for (const entry of Object.entries(headers)) {
      if (!Array.isArray(entry) || entry.length != 2) {
        throw new Error(
          'Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.',
        );
      }

      headersObj[entry[0]] = entry[1];
    }

    return headersObj;
  }
}
