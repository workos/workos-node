import {
  HttpClientInterface,
  HttpClientResponseInterface,
  RequestHeaders,
  RequestOptions,
  ResponseHeaders,
} from '../interfaces/http-client.interface';

export class HttpClient implements HttpClientInterface {
  constructor(readonly baseURL: string, readonly options?: RequestInit) {}

  /** The HTTP client name used for diagnotics */
  getClientName(): string {
    throw new Error('getClientName not implemented');
  }

  async get(
    _path: string,
    _options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    throw new Error('get not implemented');
  }

  async post<Entity = any>(
    _path: string,
    _entity: Entity,
    _options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    throw new Error('post not implemented');
  }

  async put<Entity = any>(
    _path: string,
    _entity: Entity,
    _options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    throw new Error('put not implemented');
  }

  async delete(
    _path: string,
    _options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    throw new Error('delete not implemented');
  }

  addClientToUserAgent(userAgent: string): string {
    if (userAgent.indexOf(' ') > -1) {
      return userAgent.replace(/\b\s/, `/${this.getClientName()} `);
    } else {
      return (userAgent += `/${this.getClientName()}`);
    }
  }

  static getResourceURL(
    baseURL: string,
    path: string,
    params?: Record<string, any>,
  ) {
    const queryString = HttpClient.getQueryString(params);
    const url = new URL([path, queryString].filter(Boolean).join('?'), baseURL);
    return url.toString();
  }

  static getQueryString(queryObj?: Record<string, any>) {
    if (!queryObj) return undefined;

    const sanitizedQueryObj: Record<string, any> = {};

    Object.entries(queryObj).forEach(([param, value]) => {
      if (value !== '' && value !== undefined) sanitizedQueryObj[param] = value;
    });

    return new URLSearchParams(sanitizedQueryObj).toString();
  }

  static getContentTypeHeader(entity: any): RequestHeaders | undefined {
    if (entity instanceof URLSearchParams) {
      return {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      };
    }
    return undefined;
  }

  static getBody(entity: any): BodyInit | null | undefined {
    if (entity === null || entity instanceof URLSearchParams) {
      return entity;
    }

    return JSON.stringify(entity);
  }
}

// tslint:disable-next-line
export class HttpClientResponse implements HttpClientResponseInterface {
  _statusCode: number;
  _headers: ResponseHeaders;

  constructor(statusCode: number, headers: ResponseHeaders) {
    this._statusCode = statusCode;
    this._headers = headers;
  }

  getStatusCode(): number {
    return this._statusCode;
  }

  getHeaders(): ResponseHeaders {
    return this._headers;
  }

  getRawResponse(): unknown {
    throw new Error('getRawResponse not implemented.');
  }

  toJSON(): any | null {
    throw new Error('toJSON not implemented.');
  }
}

// tslint:disable-next-line
export class HttpClientError<T> extends Error {
  readonly name: string = 'HttpClientError';
  readonly message: string = 'The request could not be completed.';
  readonly response: { status: number; headers: Headers; data: T };

  constructor({
    message,
    response,
  }: {
    message: string;
    readonly response: HttpClientError<T>['response'];
  }) {
    super(message);
    this.message = message;
    this.response = response;
  }
}
