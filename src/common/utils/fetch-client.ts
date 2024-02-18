import { FetchError } from './fetch-error';

export class FetchClient {
  constructor(readonly baseURL: string, readonly options?: RequestInit) {}

  async get(
    path: string,
    options: { params?: Record<string, any>; headers?: HeadersInit },
  ) {
    const resourceURL = this.getResourceURL(path, options.params);
    const response = await this.fetch(resourceURL, {
      headers: options.headers,
    });
    return { data: await response.json() };
  }

  async post<Entity = any>(
    path: string,
    entity: Entity,
    options: { params?: Record<string, any>; headers?: HeadersInit },
  ) {
    const resourceURL = this.getResourceURL(path, options.params);
    const bodyIsSearchParams = entity instanceof URLSearchParams;
    const contentTypeHeader = bodyIsSearchParams
      ? { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
      : undefined;
    const body =
      entity !== null
        ? bodyIsSearchParams
          ? entity
          : JSON.stringify(entity)
        : null;
    const response = await this.fetch(resourceURL, {
      method: 'POST',
      headers: { ...contentTypeHeader, ...options.headers },
      body,
    });
    return { data: await response.json() };
  }

  async put<Entity = any>(
    path: string,
    entity: Entity,
    options: { params?: Record<string, any>; headers?: HeadersInit },
  ) {
    const resourceURL = this.getResourceURL(path, options.params);
    const response = await this.fetch(resourceURL, {
      method: 'PUT',
      headers: options.headers,
      body: JSON.stringify(entity),
    });
    return { data: await response.json() };
  }

  async delete(
    path: string,
    options: { params?: Record<string, any>; headers?: HeadersInit },
  ) {
    const resourceURL = this.getResourceURL(path, options.params);
    await this.fetch(resourceURL, {
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

    return response;
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
