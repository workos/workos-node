// @oagen-ignore-file
import {
  HttpClientInterface,
  HttpClientResponseInterface,
  RequestHeaders,
  RequestOptions,
  ResponseHeaders,
} from '../interfaces/http-client.interface';

export interface HttpClientOptions extends RequestInit {
  /** Per-request timeout in milliseconds. */
  timeout?: number;
  /**
   * Maximum number of retries for transient failures. Set to `0` to disable
   * automatic retries entirely. Defaults to {@link DEFAULT_MAX_RETRY_ATTEMPTS}.
   */
  maxRetries?: number;
}

export const DEFAULT_MAX_RETRY_ATTEMPTS = 3;

export abstract class HttpClient implements HttpClientInterface {
  readonly MAX_RETRY_ATTEMPTS: number;
  readonly BACKOFF_MULTIPLIER = 1.5;
  readonly MINIMUM_SLEEP_TIME_IN_MILLISECONDS = 500;
  readonly MAXIMUM_SLEEP_TIME_IN_MILLISECONDS = 8_000;
  readonly RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

  constructor(
    readonly baseURL: string,
    readonly options?: HttpClientOptions,
  ) {
    this.MAX_RETRY_ATTEMPTS = options?.maxRetries ?? DEFAULT_MAX_RETRY_ATTEMPTS;
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

  abstract patch<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface>;

  abstract delete(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface>;

  abstract deleteWithBody<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface>;

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
      if (value !== null && value !== undefined && value !== '') {
        sanitizedQueryObj[param] = value;
      }
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

  /**
   * Generate a random idempotency key used to make retried write requests
   * safe. Mirrors the behavior of the other WorkOS SDKs (Kotlin, Go, Ruby),
   * which attach an `Idempotency-Key` header to retried POST/PUT/PATCH
   * requests that did not already specify one.
   */
  static generateIdempotencyKey(): string {
    return `retry-${globalThis.crypto.randomUUID()}`;
  }

  /**
   * Parse a `Retry-After` header value into milliseconds. Supports both the
   * delay-seconds form (e.g. `120`) and the HTTP-date form. Returns `null`
   * when the value is absent or unparseable so the caller falls back to the
   * computed exponential backoff.
   */
  static parseRetryAfter(
    headerValue: string | null | undefined,
  ): number | null {
    if (headerValue == null) {
      return null;
    }

    const trimmed = headerValue.trim();
    if (trimmed === '') {
      return null;
    }

    const asSeconds = Number(trimmed);
    if (!Number.isNaN(asSeconds)) {
      return asSeconds < 0 ? 0 : asSeconds * 1000;
    }

    const asDate = Date.parse(trimmed);
    if (!Number.isNaN(asDate)) {
      const delta = asDate - Date.now();
      return delta < 0 ? 0 : delta;
    }

    return null;
  }

  private getSleepTimeInMilliseconds(retryAttempt: number): number {
    const sleepTime = Math.min(
      this.MINIMUM_SLEEP_TIME_IN_MILLISECONDS *
        Math.pow(this.BACKOFF_MULTIPLIER, retryAttempt),
      this.MAXIMUM_SLEEP_TIME_IN_MILLISECONDS,
    );
    const jitter = Math.random() + 0.5;
    return sleepTime * jitter;
  }

  sleep = (retryAttempt: number, retryAfterMs?: number | null) =>
    new Promise((resolve) =>
      setTimeout(
        resolve,
        retryAfterMs != null
          ? retryAfterMs
          : this.getSleepTimeInMilliseconds(retryAttempt),
      ),
    );
}

// tslint:disable-next-line
export abstract class HttpClientResponse implements HttpClientResponseInterface {
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

  abstract toJSON(): Promise<any | null>;
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
