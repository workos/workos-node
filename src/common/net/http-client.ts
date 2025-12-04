import {
  HttpClientInterface,
  HttpClientResponseInterface,
  RequestHeaders,
  RequestOptions,
  ResponseHeaders,
} from '../interfaces/http-client.interface';

export abstract class HttpClient implements HttpClientInterface {
  readonly MAX_RETRY_ATTEMPTS = 3;
  readonly BACKOFF_MULTIPLIER = 1.5;
  readonly MINIMUM_SLEEP_TIME_IN_MILLISECONDS = 500;
  readonly RETRY_STATUS_CODES = [408, 500, 502, 504];

  constructor(
    readonly baseURL: string,
    readonly options?: RequestInit,
  ) {}

  /** The HTTP client name used for diagnostics */
  getClientName(): string {
    throw new Error('getClientName not implemented');
  }

  abstract get(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface>;

  abstract post<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface>;

  abstract put<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface>;

  abstract delete(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface>;

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

  static isPathRetryable(path: string): boolean {
    return (
      path.startsWith('/fga/') ||
      path.startsWith('/vault/') ||
      path.startsWith('/audit_logs/events')
    );
  }

  private getSleepTimeInMilliseconds(retryAttempt: number): number {
    const sleepTime =
      this.MINIMUM_SLEEP_TIME_IN_MILLISECONDS *
      Math.pow(this.BACKOFF_MULTIPLIER, retryAttempt);
    const jitter = Math.random() + 0.5;
    return sleepTime * jitter;
  }

  sleep = (retryAttempt: number) =>
    new Promise((resolve) =>
      setTimeout(resolve, this.getSleepTimeInMilliseconds(retryAttempt)),
    );
}

// tslint:disable-next-line
export abstract class HttpClientResponse
  implements HttpClientResponseInterface
{
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

  abstract getRawResponse(): unknown;

  abstract toJSON(): any | null;
}

// tslint:disable-next-line
export class HttpClientError<T> extends Error {
  readonly name: string = 'HttpClientError';
  readonly message: string = 'The request could not be completed.';
  readonly response: { status: number; headers: any; data: T };

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
