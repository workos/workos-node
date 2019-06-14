import { WorkOSException } from '../interfaces';

export class NotFoundException implements WorkOSException {
  readonly status: number = 404;
  readonly docsUrl: string = 'tbd';
  readonly name: string = 'NotFoundException';
  readonly message: string;

  constructor(path: string) {
    this.message = `The path '${path}' requested could not be found.`;
  }
}
