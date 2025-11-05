import { UnprocessableEntityError } from '../interfaces';
import { RequestException } from '../interfaces/request-exception.interface';

export class UnprocessableEntityException
  extends Error
  implements RequestException
{
  readonly status = 422;
  readonly name = 'UnprocessableEntityException';
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
      const requirement = errors.length === 1 ? 'requirement' : 'requirements';

      this.message = `The following ${requirement} must be met:\n`;

      for (const { code } of errors) {
        this.message = this.message.concat(`\t${code}\n`);
      }
    }
  }
}
