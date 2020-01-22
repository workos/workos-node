export interface PostOptions {
  query?: { [key: string]: any };
  idempotencyKey?: string;
}
