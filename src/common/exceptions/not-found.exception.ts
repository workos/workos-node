import { HttpException } from '../interfaces';

export class NotFoundException implements HttpException {
  readonly status: number = 404;
  readonly name: string = 'NotFoundException';
  readonly message: string;

  constructor(path: string, readonly requestID: string) {
    this.message = `The requested path '${path}' could not be found.`;
  }
}
