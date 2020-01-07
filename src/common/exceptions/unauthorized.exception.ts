import { HttpException } from '../interfaces';

export class UnauthorizedException implements HttpException {
  readonly status: number = 401;
  readonly name: string = 'UnauthorizedException';
  readonly message: string =
    'Could not authorize the request. Maybe your API key is invalid?';

  constructor(readonly requestID: string) {}
}
