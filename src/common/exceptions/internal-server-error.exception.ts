import { WorkOSException } from '../interfaces';

export class InternalServerErrorException implements WorkOSException {
  readonly status: number = 500;
  readonly docsUrl: string = 'tbd';
  readonly name: string = 'InternalServerErrorException';
  readonly message: string =
    'The request could not be completed due to an internal server error.';
}
