import { HttpException } from '../interfaces';

export class UnauthorizedException implements HttpException {
  readonly status: number = 401;
  readonly docsUrl: string = 'tbd';
  readonly name: string = 'UnauthorizedException';
  readonly message: string =
    'Could not authorize the request. Maybe your api key is invalid?';
}
