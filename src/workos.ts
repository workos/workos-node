import axios, { AxiosError, AxiosResponse, AxiosInstance } from 'axios';

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

const DEFAULT_HOSTNAME = 'api.workos.com';

export class WorkOS {
  readonly baseURL: string;
  private readonly client: AxiosInstance;

  readonly auditLog = new AuditLog(this);
  readonly sso = new SSO(this);

  constructor(readonly key?: string, readonly options: WorkOSOptions = {}) {
    if (!key) {
      this.key = process.env.WORKOS_API_KEY;

      if (!this.key) {
        throw new NoApiKeyProvidedException();
      }
    }

    if (this.options.https === undefined) {
      this.options.https = true;
    }

    const protocol: string = this.options.https ? 'https' : 'http';
    const apiHostname: string = this.options.apiHostname || DEFAULT_HOSTNAME;
    const port: number | undefined = this.options.port;
    this.baseURL = `${protocol}://${apiHostname}`;

    if (port) {
      this.baseURL = this.baseURL + `:${port}`;
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.key}`,
        'User-Agent': `workos-js/${version}`,
      },
    });
  }

  post(path: string, entity: any, query?: any): Promise<AxiosResponse> {
    try {
      return this.client.post(path, entity, { params: query });
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

// tslint:disable-next-line:no-default-export
export default WorkOS;
