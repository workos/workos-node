export class SignatureVerificationException extends Error {
  readonly name: string = 'SignatureVerificationException';
  readonly message: string =
    `Signature verification failed.`;

  constructor(
    message: string,
  ) {
    super();
    if (message) {
      this.message = message;
    }
  }
}
