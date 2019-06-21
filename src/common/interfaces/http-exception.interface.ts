export interface HttpException extends Error {
  readonly status: number;
}
