export class FetchError<T> extends Error {
  readonly name: string = 'FetchError';
  readonly message: string = 'The request could not be completed.';
  readonly response: { status: number; headers: Headers; data: T };

  constructor({
    message,
    response,
  }: {
    message: string;
    readonly response: FetchError<T>['response'];
  }) {
    super(message);
    this.message = message;
    this.response = response;
  }
}
