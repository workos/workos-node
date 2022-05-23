import pluralize from 'pluralize';

import { UnprocessableEntityError } from '../interfaces';

export class UnprocessableEntityException extends Error {
  readonly status: number = 422;
  readonly name: string = 'UnprocessableEntityException';
  readonly message: string = 'Unprocessable entity';
  readonly code?: string;
  readonly requestID: string;

  constructor({
    code,
    errors,
    message,
    requestID,
  }: {
    code?: string;
    errors?: UnprocessableEntityError[];
    message?: string;
    requestID: string;
  }) {
    super();

    this.requestID = requestID;

    if (message) {
      this.message = message;
    }

    if (code) {
      this.code = code;
    }

    if (errors) {
      const requirement: string = pluralize('requirement', errors.length);

      this.message = `The following ${requirement} must be met:\n`;

      for (const { code } of errors) {
        this.message = this.message.concat(`\t${code}\n`);
      }
    }
  }
}
