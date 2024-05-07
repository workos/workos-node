import {
  HttpClientInterface,
  HttpClientResponseInterface,
} from './http-client.interface';
import { FetchHttpClient } from './fetch-client';
import { NodeHttpClient } from './node-client';

type TimeoutError = TypeError & { code?: string };

export type RequestHeaders = Record<string, string | number | string[]>;
export type RequestOptions = {
  params?: Record<string, any>;
  headers?: RequestHeaders;
};
export type ResponseHeaderValue = string | string[];
export type ResponseHeaders = Record<string, ResponseHeaderValue>;

export function createHttpClient(
  baseURL: string,
  options?: RequestInit,
  fetchFn?: typeof fetch,
): HttpClient {
  if (typeof fetch !== 'undefined') {
    return new FetchHttpClient(baseURL, options, fetchFn);
  } else {
    return new NodeHttpClient(baseURL, options);
  }
}

export class HttpClient implements HttpClientInterface {
  static TIMEOUT_ERROR_CODE: string = 'ETIMEDOUT';

  constructor(readonly baseURL: string, readonly options?: RequestInit) {}

  async get(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    throw new Error('get not implemented');
  }

  async post<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    throw new Error('post not implemented');
  }

  async put<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    throw new Error('put not implemented');
  }

  async delete(
    path: string,
    options: RequestOptions,
  ): Promise<HttpClientResponseInterface> {
    throw new Error('delete not implemented');
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

  static makeTimeoutError(): TimeoutError {
    const timeoutErr: TimeoutError = new TypeError(this.TIMEOUT_ERROR_CODE);
    timeoutErr.code = this.TIMEOUT_ERROR_CODE;
    return timeoutErr;
  }
}

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

  toJSON(): any {
    throw new Error('toJSON not implemented.');
  }
}
