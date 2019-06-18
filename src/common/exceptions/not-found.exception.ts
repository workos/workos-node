import { HttpException } from '../interfaces';

export class NotFoundException implements HttpException {
  readonly status: number = 404;
  readonly name: string = 'NotFoundException';
  readonly message: string;

  constructor(path: string) {
    this.message = `The path '${path}' requested could not be found.`;
  }
}
