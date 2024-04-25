export class RateLimitExceededException extends Error {
  readonly name: string = 'RateLimitExceededException';

  constructor(
    readonly message: string,
    readonly requestID: string,
    readonly retryAfter: number | null,
  ) {
    super();
  }
}
