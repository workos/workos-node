export class GenericServerException extends Error {
  readonly name: string = 'GenericServerException';
  readonly message: string = 'The request could not be completed.';

  constructor(
    readonly status: number,
    message: string | undefined,
    readonly rawData: unknown,
    readonly requestID: string,
  ) {
    super();
    if (message) {
      this.message = message;
    }
  }
}
