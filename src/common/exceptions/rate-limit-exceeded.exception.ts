import { RequestException } from '../interfaces/request-exception.interface';

export class RateLimitExceededException
  extends Error
  implements RequestException
{
  readonly name = 'RateLimitExceededException';
  readonly status = 429;

  constructor(
    readonly message: string,
    readonly requestID: string,
    /**
     * The number of seconds to wait before retrying the request.
     */
    readonly retryAfter: number | null,
  ) {
    super();
  }
}
