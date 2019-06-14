import { WorkOSException } from '../interfaces';

export class UnauthorizedException implements WorkOSException {
  readonly status: number = 401;
  readonly docsUrl: string = 'tbd';
  readonly name: string = 'UnauthorizedException';
  readonly message: string =
    'Could not authorize the request. Maybe your api key is invalid?';
}
