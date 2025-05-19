import { RequestException } from '../interfaces/request-exception.interface';

export class ConflictException extends Error implements RequestException {
  readonly status = 409;
  readonly name = 'ConflictException';
  readonly requestID: string;

  constructor({
    error,
    message,
    requestID,
  }: {
    error?: string;
    message?: string;
    requestID: string;
  }) {
    super();

    this.requestID = requestID;

    if (message) {
      this.message = message;
    } else if (error) {
      this.message = `Error: ${error}`;
    } else {
      this.message = `An conflict has occurred on the server.`;
    }
  }
}
