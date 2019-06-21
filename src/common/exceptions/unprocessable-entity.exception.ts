import pluralize from 'pluralize';

import { HttpException, UnprocessableEntityError } from '../interfaces';

export class UnprocessableEntityException implements HttpException {
  readonly status: number = 422;
  readonly name: string = 'UnprocessableEntityException';
  readonly message: string;

  constructor(errors: UnprocessableEntityError[]) {
    const requirement: string = pluralize('requirement', errors.length);

    this.message = `The following ${requirement} must be met:\n`;

    for (const error of errors) {
      this.message.concat(`\t${error.code}\n`);
    }
  }
}
