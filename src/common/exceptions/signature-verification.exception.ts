export class SignatureVerificationException extends Error {
  readonly name = 'SignatureVerificationException';

  constructor(message: string) {
    super(message || 'Signature verification failed.');
  }
}
