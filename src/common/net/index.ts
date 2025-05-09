import { FetchHttpClient } from './fetch-client';
import { HttpClient } from './http-client';

export function createHttpClient(
  baseURL: string,
  options: RequestInit,
  fetchFn?: typeof fetch,
): HttpClient {
  return new FetchHttpClient(baseURL, options, fetchFn);
}
