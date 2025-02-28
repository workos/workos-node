import { FetchHttpClient } from './fetch-client';
import { HttpClient } from './http-client';

export function createHttpClient(
  baseURL: string,
  options: RequestInit,
  fetchFn?: typeof fetch,
): HttpClient {
  if (typeof fetch !== 'undefined' || typeof fetchFn !== 'undefined') {
    return new FetchHttpClient(baseURL, options, fetchFn);
  } else {
    throw new Error('Please upgrade your Node.js version to 18 or higher');
  }
}

export * from './fetch-client';
export * from './http-client';
