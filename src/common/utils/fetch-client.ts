import { getQueryString } from './query-string';

export function createFetchClient({
  baseURL,
  options: globalOptions,
}: {
  baseURL: string;
  options: RequestInit;
}) {
  function getResourceURL(path: string, params?: Record<string, any>) {
    const queryString = getQueryString(params);
    return new URL([path, queryString].join('?'), baseURL);
  }

  async function _fetch(url: URL, options?: RequestInit) {
    const response = await fetch(url, {
      ...globalOptions,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...globalOptions.headers,
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

  return {
    async get(
      path: string,
      options: { params?: Record<string, any>; headers?: HeadersInit },
    ) {
      const resourceURL = getResourceURL(path, options.params);
      const response = await _fetch(resourceURL, { headers: options.headers });
      return { data: await response.json() };
    },

    async post<P = any>(
      path: string,
      entity: P,
      options: { params?: Record<string, any>; headers?: HeadersInit },
    ) {
      const resourceURL = getResourceURL(path, options.params);
      const response = await _fetch(resourceURL, {
        method: 'POST',
        headers: options.headers,
        body: JSON.stringify(entity),
      });
      return { data: await response.json() };
    },

    async put<P = any>(
      path: string,
      entity: P,
      options: { params?: Record<string, any>; headers?: HeadersInit },
    ) {
      const resourceURL = getResourceURL(path, options.params);
      const response = await _fetch(resourceURL, {
        method: 'PUT',
        headers: options.headers,
        body: JSON.stringify(entity),
      });
      return { data: await response.json() };
    },

    async delete(
      path: string,
      options: { params?: Record<string, any>; headers?: HeadersInit },
    ) {
      const resourceURL = getResourceURL(path, options.params);
      await _fetch(resourceURL, { method: 'DELETE', headers: options.headers });
    },
  };
}

export class FetchError<T> extends Error {
  readonly name: string = 'FetchError';
  readonly message: string = 'The request could not be completed.';
  readonly response: { status: number; headers: Headers; data: T };

  constructor({
    message,
    response,
  }: {
    message: string;
    readonly response: FetchError<T>['response'];
  }) {
    super(message);
    this.message = message;
    this.response = response;
  }
}
