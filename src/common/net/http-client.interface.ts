export type RequestOptions = {
  params?: Record<string, any>;
  headers?: HeadersInit;
};

export default interface HttpClientInterface {
  get(path: string, options: RequestOptions): any;
  post<Entity = any>(
    path: string,
    entity: Entity,
    options: RequestOptions,
  ): any;
  put<Entity = any>(path: string, entity: Entity, options: RequestOptions): any;
  delete(path: string, options: RequestOptions): any;
}
