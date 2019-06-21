import { HttpException } from '../interfaces';

export class InternalServerErrorException implements HttpException {
  readonly status: number = 500;
  readonly name: string = 'InternalServerErrorException';
  readonly message: string =
    'The request could not be completed due to an internal server error.';
}
