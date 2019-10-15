import axios, { AxiosError } from 'axios';

import { Auditlog } from './auditlog/auditlog';
import { API_HOSTNAME } from './common/constants';
import {
  InternalServerErrorException,
  NoApiKeyProvidedException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from './common/exceptions';
import { version } from '../package.json';
import { WorkOSOptions } from './common/interfaces';

// tslint:disable-next-line:no-default-export
export default class WorkOS {
  readonly auditlog: Auditlog = new Auditlog(this);

  constructor(
    private readonly key?: string,
    private readonly options: WorkOSOptions = {},
  ) {
    if (!key) {
      this.key = process.env.WORKOS_API_KEY;

      if (!this.key) {
        throw new NoApiKeyProvidedException();
      }
    }
  }

  async post(entity: any, path: string) {
    const { apiHostname = API_HOSTNAME } = this.options;

    try {
      await axios.post(`https://${apiHostname}${path}`, entity, {
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
