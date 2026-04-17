import { RequestException } from '../interfaces/request-exception.interface';

export interface WorkOSErrorData {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export class GenericServerException extends Error implements RequestException {
  readonly name: string = 'GenericServerException';
  readonly message: string = 'The request could not be completed.';
  readonly code: string | undefined;

  constructor(
    readonly status: number,
    message: string | undefined,
    readonly rawData: WorkOSErrorData,
    readonly requestID: string,
  ) {
    super();
    if (message) {
      this.message = message;
    }
    this.code = rawData.code;
  }
}
