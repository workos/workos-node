import { FetchHttpClient } from './fetch-client';
import { HttpClient } from './http-client';
import { NodeHttpClient } from './node-client';

export function createHttpClient(
  baseURL: string,
  options: RequestInit,
  fetchFn?: typeof fetch,
): HttpClient {
  if (typeof fetch !== 'undefined' || typeof fetchFn !== 'undefined') {
    return new FetchHttpClient(baseURL, options, fetchFn);
  } else {
    return new NodeHttpClient(baseURL, options);
  }
}

export * from './fetch-client';
export * from './node-client';
export * from './http-client';
