export class FetchClient {
  constructor(readonly baseURL: string, readonly options?: RequestInit) {
    this.baseURL = baseURL;
    this.options = options;
  }

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
    const response = await this.fetch(resourceURL, {
      method: 'POST',
      headers: options.headers,
      body: JSON.stringify(entity),
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
    return new URL([path, queryString].filter(Boolean).join('?'), this.baseURL);
  }

  private async fetch(url: URL, options?: RequestInit) {
    const response = await fetch(url, {
      ...this.options,
      ...options,
      headers: {
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

function getQueryString(queryObj?: Record<string, any>) {
  if (!queryObj) return undefined;

  const sanitizedQueryObj: Record<string, any> = {};

  Object.entries(queryObj).forEach(([param, value]) => {
    if (value !== '' && value !== undefined) sanitizedQueryObj[param] = value;
  });

  return new URLSearchParams(sanitizedQueryObj).toString();
}
