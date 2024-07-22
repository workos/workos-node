import { RequestException } from '../interfaces/request-exception.interface';

export class NotFoundException extends Error implements RequestException {
  readonly status = 404;
  readonly name = 'NotFoundException';
  readonly message: string;
  readonly code?: string;
  readonly requestID: string;

  constructor({
    code,
    message,
    path,
    requestID,
  }: {
    code?: string;
    message?: string;
    path: string;
    requestID: string;
  }) {
    super();
    this.code = code;
    this.message =
      message ?? `The requested path '${path}' could not be found.`;
    this.requestID = requestID;
  }
}
