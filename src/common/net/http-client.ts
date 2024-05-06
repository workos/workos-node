import HttpClientInterface, { RequestOptions } from './http-client.interface';
import { FetchHttpClient } from './fetch-client';
import { NodeHttpClient } from './node-client';

type TimeoutError = TypeError & { code?: string };

const TIMEOUT_ERROR_CODE: string = 'ETIMEDOUT';

async function createHttpClient(fetchFn?: typeof fetch): HttpClient {
  if (typeof fetch !== 'undefined') {
    return new FetchHttpClient(fetchFn);
  } else {
    return new NodeHttpClient();
  }
}

export class HttpClient implements HttpClientInterface {
  static TIMEOUT_ERROR_CODE: string = 'ETIMEDOUT';

  constructor(readonly baseURL: string, readonly options?: RequestInit) {}

  async get(path: string, options: RequestOptions): Promise<Response> {
    throw new Error('get not implemented');
  }

  async post<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<Response> {
    throw new Error('post not implemented');
  }

  async put<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): Promise<Response> {
    throw new Error('put not implemented');
  }

  async delete(path: string, options: RequestOptions): Promise<Response> {
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

  static getContentTypeHeader(entity: any): HeadersInit | undefined {
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
    const timeoutErr: TimeoutError = new TypeError(TIMEOUT_ERROR_CODE);
    timeoutErr.code = TIMEOUT_ERROR_CODE;
    return timeoutErr;
  }
}
