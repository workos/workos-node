import { HttpException } from '../interfaces';

export class GenericServerException implements HttpException {
  readonly name: string = 'GenericServerException';
  readonly message: string = 'The request could not be completed.';

  constructor(
    readonly status: number,
    message: string | undefined,
    readonly requestID: string,
  ) {
    if (message) {
      this.message = message;
    }
  }
}
