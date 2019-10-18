import axios, { AxiosError, AxiosResponse } from 'axios';
import queryString from 'query-string';

import { API_HOSTNAME } from './common/constants';
import { AuditLog } from './audit-log/audit-log';
import {
  InternalServerErrorException,
  NoApiKeyProvidedException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from './common/exceptions';
import { SSO } from './sso/sso';
import { version } from '../package.json';
import { WorkOSOptions } from './common/interfaces';

// tslint:disable-next-line:no-default-export
export default class WorkOS {
  readonly auditLog = new AuditLog(this);
  readonly sso = new SSO(this);

  constructor(readonly key?: string, readonly options: WorkOSOptions = {}) {
    if (!key) {
      this.key = process.env.WORKOS_API_KEY;

      if (!this.key) {
        throw new NoApiKeyProvidedException();
      }
    }
  }

  async post(path: string, entity: any, query?: any): Promise<AxiosResponse> {
    const { apiHostname = API_HOSTNAME } = this.options;
    let url = `https://${apiHostname}${path}`;

    if (query) {
      const querystring = queryString.stringify(query);
      url = url.concat(`?${querystring}`);
    }

    try {
      return await axios.post(url, entity, {
        headers: {
          Authorization: `Bearer ${this.key}`,
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
          default: {
            throw new InternalServerErrorException();
          }
        }
      }

      throw error;
    }
  }
}
