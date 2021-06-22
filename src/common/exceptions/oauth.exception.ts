export class OauthException extends Error {
  readonly name: string = 'OauthException';

  constructor(
    readonly status: number,
    readonly requestID: string,
    readonly error: string | undefined,
    readonly errorDescription: string | undefined,
  ) {
    super();
    if (error && errorDescription) {
      this.message = `Error: ${error}\nError Description: ${errorDescription}`;
    } else if (error) {
      this.message = `Error: ${error}`;
    }
  }
}
