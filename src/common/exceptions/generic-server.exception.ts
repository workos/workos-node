export class GenericServerException extends Error {
  readonly name: string = 'GenericServerException';
  readonly rawData: unknown;
  readonly message: string = 'The request could not be completed.';

  constructor(
    readonly status: number,
    message: string | undefined,
    rawData: unknown,
    readonly requestID: string,
  ) {
    super();
    if (message) {
      this.message = message;
      this.rawData = rawData;
    }
  }
}
