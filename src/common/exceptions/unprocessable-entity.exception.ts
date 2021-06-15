import pluralize from 'pluralize';

import { UnprocessableEntityError } from '../interfaces';

export class UnprocessableEntityException extends Error {
  readonly status: number = 422;
  readonly name: string = 'UnprocessableEntityException';
  readonly message: string;

  constructor(
    errors: UnprocessableEntityError[],
    readonly requestID: string,
    readonly err: string,
    readonly errDescription: string,
  ) {
    super();
    const requirement: string = pluralize('requirement', errors.length);

    this.message = `Error: ${err}\nError Description: ${errDescription}\nThe following ${requirement} must be met:\n`;

    for (const { code } of errors) {
      this.message = this.message.concat(`\t${code}\n`);
    }
  }
}
