import axios, { AxiosError } from 'axios';

import { AuditLog } from './audit-log/audit-log';
import { RestEntity, WorkOSOptions } from './common/interfaces';
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from './common/exceptions';
import { version } from '../package.json';

export class WorkOS {
  private readonly options: WorkOSOptions;

  // tslint:disable:next-line variable-namepp
  public readonly AuditLog: AuditLog;

  constructor(options: WorkOSOptions) {
    this.options = options;
    this.AuditLog = new AuditLog(this);
  }

  async post(entity: RestEntity) {
    const { path } = entity;
    const { apiKey, apiEndpoint = 'api.workos.com' } = this.options;

    try {
      await axios.post(`https://${apiEndpoint}${path}`, entity, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': `workos-js/${version}`,
        },
      });
    } catch (error) {
      const { response } = error as AxiosError;

      if (response) {
        const { status, data } = response;
        switch (status) {
          case 401: {
            throw new UnauthorizedException();
          }
          case 422: {
            const { errors } = data;

            throw new UnprocessableEntityException(errors);
          }
          case 404: {
            throw new NotFoundException(path);
          }
          case 500: {
            throw new InternalServerErrorException();
          }
        }
      }
    }
  }
}
