import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { AuditTrail } from './audit-trail/audit-trail';
import {
  GenericServerException,
  NoApiKeyProvidedException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  OauthException,
} from './common/exceptions';
import {
  GetOptions,
  PostOptions,
  PutOptions,
  WorkOSOptions,
  WorkOSResponseError,
} from './common/interfaces';
import { DirectorySync } from './directory-sync/directory-sync';
import { Events } from './events/events';
import { Organizations } from './organizations/organizations';
import { OrganizationDomains } from './organization-domains/organization-domains';
import { Passwordless } from './passwordless/passwordless';
import { Portal } from './portal/portal';
import { SSO } from './sso/sso';
import { Webhooks } from './webhooks/webhooks';
import { Mfa } from './mfa/mfa';
import { AuditLogs } from './audit-logs/audit-logs';
import { UserManagement } from './user-management/user-management';
import { BadRequestException } from './common/exceptions/bad-request.exception';

const VERSION = '3.9.1';

const DEFAULT_HOSTNAME = 'api.workos.com';

export class WorkOS {
  readonly baseURL: string;
  private readonly client: AxiosInstance;

  readonly auditLogs = new AuditLogs(this);
  readonly auditTrail = new AuditTrail(this);
  readonly directorySync = new DirectorySync(this);
  readonly organizations = new Organizations(this);
  readonly organizationDomains = new OrganizationDomains(this);
  readonly passwordless = new Passwordless(this);
  readonly portal = new Portal(this);
  readonly sso = new SSO(this);
  readonly webhooks = new Webhooks();
  readonly mfa = new Mfa(this);
  readonly events = new Events(this);
  readonly userManagement = new UserManagement(this);

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
      ...options.axios,
      baseURL: this.baseURL,
      headers: {
        ...options.axios?.headers,
        Authorization: `Bearer ${this.key}`,
        'User-Agent': `workos-node/${VERSION}`,
      },
    });
  }

  get version() {
    return VERSION;
  }

  async post<T = any, D = any, P = any>(
    path: string,
    entity: P,
    options: PostOptions = {},
  ): Promise<AxiosResponse<T, D>> {
    const requestHeaders: any = {};

    if (options.idempotencyKey) {
      requestHeaders['Idempotency-Key'] = options.idempotencyKey;
    }

    try {
      return await this.client.post<any, AxiosResponse<T, D>, P>(path, entity, {
        params: options.query,
        headers: requestHeaders,
      });
    } catch (error) {
      this.handleAxiosError({ path, error });

      throw error;
    }
  }

  async get<T = any, D = any>(
    path: string,
    options: GetOptions = {},
  ): Promise<AxiosResponse<T, D>> {
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
      this.handleAxiosError({ path, error });

      throw error;
    }
  }

  async put<T = any, D = any>(
    path: string,
    entity: any,
    options: PutOptions = {},
  ): Promise<AxiosResponse<T, D>> {
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
      this.handleAxiosError({ path, error });

      throw error;
    }
  }

  async delete<T = any, D = any>(
    path: string,
    query?: any,
  ): Promise<AxiosResponse<T, D>> {
    try {
      return await this.client.delete(path, {
        params: query,
      });
    } catch (error) {
      this.handleAxiosError({ path, error });

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

  private handleAxiosError({ path, error }: { path: string; error: unknown }) {
    const { response } = error as AxiosError<WorkOSResponseError>;

    if (response) {
      const { status, data, headers } = response;
      const requestID = headers['X-Request-ID'];
      const {
        code,
        error_description: errorDescription,
        error,
        errors,
        message,
      } = data;

      switch (status) {
        case 401: {
          throw new UnauthorizedException(requestID);
        }
        case 422: {
          const { errors } = data;

          throw new UnprocessableEntityException({
            code,
            errors,
            message,
            requestID,
          });
        }
        case 404: {
          throw new NotFoundException({
            code,
            message,
            path,
            requestID,
          });
        }
        default: {
          if (error || errorDescription) {
            throw new OauthException(
              status,
              requestID,
              error,
              errorDescription,
              data,
            );
          } else if (code && errors) {
            // Note: ideally this should be mapped directly with a `400` status code.
            // However, this would break existing logic for the `OauthException` exception.
            throw new BadRequestException({
              code,
              errors,
              message,
              requestID,
            });
          } else {
            throw new GenericServerException(
              status,
              data.message,
              data,
              requestID,
            );
          }
        }
      }
    }
  }
}
