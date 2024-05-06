import { RequestOptions } from './http-client.interface';
import { HttpClient } from './http-client';

export class FetchHttpClient extends HttpClient implements HttpClient {
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

  async get(path: string, options: RequestOptions): Promise<Response> {
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
  ): Promise<Response> {
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
  ): Promise<Response> {
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

  async delete(path: string, options: RequestOptions): Promise<Response> {
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
    headers?: HeadersInit | undefined,
  ): Promise<Response> {
    // For methods which expect payloads, we should always pass a body value
    // even when it is empty. Without this, some JS runtimes (eg. Deno) will
    // inject a second Content-Length header.
    const methodHasPayload =
      method == 'POST' || method == 'PUT' || method == 'PATCH';

    const requestBody = body || (methodHasPayload ? '' : undefined);

    const response = await this._fetchFn(url, {
      method,
      headers,
      body: requestBody,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  }
}
