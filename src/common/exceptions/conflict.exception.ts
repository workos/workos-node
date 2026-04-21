import { RequestException } from '../interfaces/request-exception.interface';

export class ConflictException extends Error implements RequestException {
  readonly status = 409;
  readonly name = 'ConflictException';
  readonly requestID: string;
  readonly code?: string;

  constructor({
    error,
    message,
    requestID,
    code,
  }: {
    error?: string;
    message?: string;
    requestID: string;
    code?: string;
  }) {
    super();

    this.requestID = requestID;

    if (message) {
      this.message = message;
    } else if (error) {
      this.message = `Error: ${error}`;
    } else {
      this.message = `A conflict has occurred on the server.`;
    }

    this.code = code;
  }
}
