export class NotFoundException extends Error {
  readonly status: number = 404;
  readonly name: string = 'NotFoundException';
  readonly message: string;

  constructor(
    path: string,
    readonly requestID: string,
    readonly err: string,
    readonly errDescription: string,
  ) {
    super();
    this.message = `The requested path '${path}' could not be found.\n Error: ${err}\n Error Description: ${errDescription}`;
  }
}
