export class SignatureVerificationException extends Error {
  readonly name: string = 'SignatureVerificationException';
  readonly message: string =
    `Signature verification failed.`;

  constructor(
    message: string | undefined,
  ) {
    super();
    if (message) {
      this.message = message;
    }
  }
}
