export class GenericServerException extends Error {
  readonly name: string = 'GenericServerException';
  readonly message: string = 'The request could not be completed.';

  constructor(
    readonly status: number,
    message: string | undefined,
    readonly requestID: string,
    readonly err: string | undefined,
    readonly errDescription: string | undefined,
  ) {
    super();
    if (message) {
      this.message =
        message + `\nError: ${err}\nError Description: ${errDescription}`;
    }
  }
}
