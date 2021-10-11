export class SignatureVerificationException extends Error {
  readonly name: string = 'SignatureVerificationException';

  constructor(message: string) {
    super(message || 'Signature verification failed.');
  }
}
