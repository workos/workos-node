export class UnauthorizedException extends Error {
  readonly status: number = 401;
  readonly name: string = 'UnauthorizedException';
  readonly message: string;

  constructor(
    readonly requestID: string,
    readonly err: string,
    readonly errDescription: string,
  ) {
    super();
    this.message = `Could not authorize the request. Maybe your API key is invalid?\nError: ${err}\nError Description: ${errDescription}`;
  }
}
