import { RequestException } from '../interfaces/request-exception.interface';

export class UnauthorizedException extends Error implements RequestException {
  readonly status: number = 401;
  readonly name: string = 'UnauthorizedException';
  readonly message: string;

  constructor(readonly requestID: string) {
    super();
    this.message = `Could not authorize the request. Maybe your API key is invalid?`;
  }
}
