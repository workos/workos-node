// @oagen-ignore-file
import { RequestException } from '../interfaces/request-exception.interface';

export class ParseError extends Error implements RequestException {
  readonly name = 'ParseError';
  readonly status = 500;
  readonly rawBody: string;
  readonly rawStatus: number;
  readonly requestID: string;
  readonly rawHeaders?: Headers;

  constructor({
    message,
    rawBody,
    rawStatus,
    requestID,
    rawHeaders,
  }: {
    message: string;
    rawBody: string;
    requestID: string;
    rawStatus: number;
    rawHeaders?: Headers;
  }) {
    super(message);
    this.rawBody = rawBody;
    this.rawStatus = rawStatus;
    this.requestID = requestID;
    this.rawHeaders = rawHeaders;
  }
}
