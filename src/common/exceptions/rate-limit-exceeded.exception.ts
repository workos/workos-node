import { GenericServerException } from './generic-server.exception';

// Inheriting from `GenericServerException` in order to maintain backwards
// compatibility with what 429 errors would have previously been thrown as.
//
// TODO: Consider making it the base class for all request errors.
export class RateLimitExceededException extends GenericServerException {
  readonly name = 'RateLimitExceededException';

  constructor(
    message: string,
    requestID: string,
    /**
     * The number of seconds to wait before retrying the request.
     */
    readonly retryAfter: number | null,
  ) {
    super(429, message, {}, requestID);
  }
}
