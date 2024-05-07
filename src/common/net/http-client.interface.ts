import { RequestOptions, ResponseHeaders } from './http-client';

export interface HttpClientInterface {
  get(path: string, options: RequestOptions): any;
  post<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): any;
  put<Entity = any>(path: string, entity: Entity, options: RequestOptions): any;
  delete(path: string, options: RequestOptions): any;
}

export interface HttpClientResponseInterface {
  getStatusCode: () => number;
  getHeaders: () => ResponseHeaders;
  getRawResponse: () => unknown;
  toJSON: () => Promise<any>;
}
