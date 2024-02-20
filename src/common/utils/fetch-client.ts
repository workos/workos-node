import { FetchError } from './fetch-error';

export class FetchClient {
  constructor(readonly baseURL: string, readonly options?: RequestInit) {}

  async get(
    path: string,
    options: { params?: Record<string, any>; headers?: HeadersInit },
  ) {
    const resourceURL = this.getResourceURL(path, options.params);
    return await this.fetch(resourceURL, {
      headers: options.headers,
    });
  }

  async post<Entity = any>(
    path: string,
    entity: Entity,
    options: { params?: Record<string, any>; headers?: HeadersInit },
  ) {
    const resourceURL = this.getResourceURL(path, options.params);
    return await this.fetch(resourceURL, {
      method: 'POST',
      headers: { ...getContentTypeHeader(entity), ...options.headers },
      body: getBody(entity),
    });
  }

  async put<Entity = any>(
    path: string,
    entity: Entity,
    options: { params?: Record<string, any>; headers?: HeadersInit },
  ) {
    const resourceURL = this.getResourceURL(path, options.params);
    return await this.fetch(resourceURL, {
      method: 'PUT',
      headers: { ...getContentTypeHeader(entity), ...options.headers },
      body: getBody(entity),
    });
  }

  async delete(
    path: string,
    options: { params?: Record<string, any>; headers?: HeadersInit },
  ) {
    const resourceURL = this.getResourceURL(path, options.params);
    return await this.fetch(resourceURL, {
      method: 'DELETE',
      headers: options.headers,
    });
  }

  private getResourceURL(path: string, params?: Record<string, any>) {
    const queryString = getQueryString(params);
    const url = new URL(
      [path, queryString].filter(Boolean).join('?'),
      this.baseURL,
    );
    return url.toString();
  }

  private async fetch(url: string, options?: RequestInit) {
    const response = await fetch(url, {
      ...this.options,
      ...options,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        ...this.options?.headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new FetchError({
        message: response.statusText,
        response: {
          status: response.status,
          headers: response.headers,
          data: await response.json(),
        },
      });
    }

    const contentType = response.headers.get('content-type');
    const isJsonResponse = contentType?.includes('application/json');

    if (isJsonResponse) {
      return { data: await response.json() };
    }

    return { data: null };
  }
}

function getQueryString(queryObj?: Record<string, any>) {
  if (!queryObj) return undefined;

  const sanitizedQueryObj: Record<string, any> = {};

  Object.entries(queryObj).forEach(([param, value]) => {
    if (value !== '' && value !== undefined) sanitizedQueryObj[param] = value;
  });

  return new URLSearchParams(sanitizedQueryObj).toString();
}

function getContentTypeHeader(entity: any): HeadersInit | undefined {
  if (entity instanceof URLSearchParams) {
    return {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
  }
  return undefined;
}

function getBody(entity: any): BodyInit | null | undefined {
  if (entity === null || entity instanceof URLSearchParams) {
    return entity;
  }

  return JSON.stringify(entity);
}
