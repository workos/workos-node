import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { version } from '../package.json';
import { AuditTrail } from './audit-trail/audit-trail';
import {
  GenericServerException,
  NoApiKeyProvidedException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from './common/exceptions';
import {
  GetOptions,
  PostOptions,
  PutOptions,
  WorkOSOptions,
} from './common/interfaces';
import { DirectorySync } from './directory-sync/directory-sync';
import { Organizations } from './organizations/organizations';
import { Passwordless } from './passwordless/passwordless';
import { Portal } from './portal/portal';
import { SSO } from './sso/sso';

const DEFAULT_HOSTNAME = 'api.workos.com';

export class WorkOS {
  readonly baseURL: string;
  private readonly client: AxiosInstance;

  readonly auditTrail = new AuditTrail(this);
  readonly directorySync = new DirectorySync(this);
  readonly organizations = new Organizations(this);
  readonly passwordless = new Passwordless(this);
  readonly portal = new Portal(this);
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
        const error = 'error';
        const err = data[error];
        const desc = 'error_description';
        const errDescription = data[desc];

        switch (status) {
          case 401: {
            throw new UnauthorizedException(requestID, err, errDescription);
          }
          case 422: {
            const { errors } = data;

            throw new UnprocessableEntityException(
              errors,
              requestID,
              err,
              errDescription,
            );
          }
          case 404: {
            throw new NotFoundException(path, requestID, err, errDescription);
          }
          default: {
            throw new GenericServerException(
              status,
              data.message,
              requestID,
              err,
              errDescription,
            );
          }
        }
      }

      throw error;
    }
  }

  async get(path: string, options: GetOptions = {}): Promise<AxiosResponse> {
    try {
      const { accessToken } = options;

      return await this.client.get(path, {
        params: options.query,
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      });
    } catch (error) {
      const { response } = error as AxiosError;

      if (response) {
        const { status, data, headers } = response;
        const requestID = headers['X-Request-ID'];
        const error = 'error';
        const err = data[error];
        const desc = 'error_description';
        const errDescription = data[desc];

        switch (status) {
          case 401: {
            throw new UnauthorizedException(requestID, err, errDescription);
          }
          case 422: {
            const { errors } = data;

            throw new UnprocessableEntityException(
              errors,
              requestID,
              err,
              errDescription,
            );
          }
          case 404: {
            throw new NotFoundException(path, requestID, err, errDescription);
          }
          default: {
            throw new GenericServerException(
              status,
              data.message,
              requestID,
              err,
              errDescription,
            );
          }
        }
      }

      throw error;
    }
  }

  async put(
    path: string,
    entity: any,
    options: PutOptions = {},
  ): Promise<AxiosResponse> {
    const requestHeaders: any = {};

    if (options.idempotencyKey) {
      requestHeaders['Idempotency-Key'] = options.idempotencyKey;
    }

    try {
      return await this.client.put(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });
    } catch (error) {
      const { response } = error as AxiosError;

      if (response) {
        const { status, data, headers } = response;
        const requestID = headers['X-Request-ID'];
        const error = 'error';
        const err = data[error];
        const desc = 'error_description';
        const errDescription = data[desc];

        switch (status) {
          case 401: {
            throw new UnauthorizedException(requestID, err, errDescription);
          }
          case 422: {
            const { errors } = data;

            throw new UnprocessableEntityException(
              errors,
              requestID,
              err,
              errDescription,
            );
          }
          case 404: {
            throw new NotFoundException(path, requestID, err, errDescription);
          }
          default: {
            throw new GenericServerException(
              status,
              data.message,
              requestID,
              err,
              errDescription,
            );
          }
        }
      }

      throw error;
    }
  }

  async delete(path: string, query?: any): Promise<AxiosResponse> {
    try {
      return await this.client.delete(path, {
        params: query,
      });
    } catch (error) {
      const { response } = error as AxiosError;

      if (response) {
        const { status, data, headers } = response;
        const requestID = headers['X-Request-ID'];
        const error = 'error';
        const err = data[error];
        const desc = 'error_description';
        const errDescription = data[desc];

        switch (status) {
          case 401: {
            throw new UnauthorizedException(requestID, err, errDescription);
          }
          case 422: {
            const { errors } = data;

            throw new UnprocessableEntityException(
              errors,
              requestID,
              err,
              errDescription,
            );
          }
          case 404: {
            throw new NotFoundException(path, requestID, err, errDescription);
          }
          default: {
            throw new GenericServerException(
              status,
              data.message,
              requestID,
              err,
              errDescription,
            );
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
