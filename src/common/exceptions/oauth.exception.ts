import { RequestException } from '../interfaces/request-exception.interface';

export class OauthException extends Error implements RequestException {
  readonly name = 'OauthException';

  constructor(
    readonly status: number,
    readonly requestID: string,
    readonly error: string | undefined,
    readonly errorDescription: string | undefined,
    readonly rawData: unknown,
  ) {
    super();
    if (error && errorDescription) {
      this.message = `Error: ${error}\nError Description: ${errorDescription}`;
    } else if (error) {
      this.message = `Error: ${error}`;
    } else {
      this.message = `An error has occurred.`;
    }
  }
}
