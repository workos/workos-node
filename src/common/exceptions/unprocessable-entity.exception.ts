import { HttpException, UnprocessableEntityError } from '../interfaces';

export class UnprocessableEntityException implements HttpException {
  readonly status: number = 422;
  readonly name: string = 'UnprocessableEntityException';
  readonly message: string;

  constructor(errors: UnprocessableEntityError[]) {
    const plural: string = errors.length > 1 ? 's' : '';
    this.message = `The following requirement${plural} must be met:\n`;

    for (const error of errors) {
      this.message.concat(`\t${error.code}\n`);
    }
  }
}
