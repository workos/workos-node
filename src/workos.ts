import axios, { AxiosError, AxiosResponse, AxiosInstance } from 'axios';

import { AuditTrail } from './audit-trail/audit-trail';
import { DirectorySync } from './directory-sync/directory-sync';
import {
  NoApiKeyProvidedException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  GenericServerException,
} from './common/exceptions';
import { SSO } from './sso/sso';
import { version } from '../package.json';
import { WorkOSOptions, PostOptions } from './common/interfaces';

const DEFAULT_HOSTNAME = 'api.workos.com';

export class WorkOS {
  readonly baseURL: string;
  private readonly client: AxiosInstance;

  readonly auditTrail = new AuditTrail(this);
  readonly directorySync = new DirectorySync(this);
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
        'User-Agent': `workos-node/${version}`,
      },
    });
  }

  async post(
    path: string,
    entity: any,
    options: PostOptions = {},
  ): Promise<AxiosResponse> {
    const requestHeaders: any = {};

    if (options.idempotencyKey) {
      requestHeaders['Idempotency-Key'] = options.idempotencyKey;
    }

    try {
      return await this.client.post(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });
    } catch (error) {
      const { response } = error as AxiosError;

      if (response) {
        const { status, data, headers } = response;
        const requestID = headers['X-Request-ID'];

        switch (status) {
          case 401: {
            throw new UnauthorizedException(requestID);
          }
          case 422: {
            const { errors } = data;

            throw new UnprocessableEntityException(errors, requestID);
          }
          case 404: {
            throw new NotFoundException(path, requestID);
          }
          default: {
            throw new GenericServerException(status, data.message, requestID);
          }
        }
      }

      throw error;
    }
  }

  async get(path: string, query?: any): Promise<AxiosResponse> {
    try {
      return await this.client.get(path, {
        params: query,
      });
    } catch (error) {
      const { response } = error as AxiosError;

      if (response) {
        const { status, data, headers } = response;
        const requestID = headers['X-Request-ID'];

        switch (status) {
          case 401: {
            throw new UnauthorizedException(requestID);
          }
          case 422: {
            const { errors } = data;

            throw new UnprocessableEntityException(errors, requestID);
          }
          case 404: {
            throw new NotFoundException(path, requestID);
          }
          default: {
            throw new GenericServerException(status, data.message, requestID);
          }
        }
      }

      throw error;
    }
  }

  emitWarning(warning: string) {
    if (typeof process.emitWarning !== 'function') {
      //  tslint:disable:no-console
      return console.warn(`WorkOS: ${warning}`);
    }

    return process.emitWarning(warning, 'WorkOS');
  }
}

// tslint:disable-next-line:no-default-export
export default WorkOS;
