import axios, { AxiosError } from 'axios';

import { API_HOSTNAME } from './common/constants';
import {
  InternalServerErrorException,
  NoApiKeyProvidedException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from './common/exceptions';
import { WorkOSOptions, Event } from './common/interfaces';
import { version } from '../package.json';

// tslint:disable-next-line:no-default-export
export default class WorkOS {
  private readonly options: WorkOSOptions;

  constructor(options: WorkOSOptions = {}) {
    this.options = options;
    const { apiKey } = this.options;

    if (!apiKey) {
      const envKey = process.env.WORKOS_API_KEY;

      if (envKey) {
        this.options.apiKey = envKey;
      } else {
        throw new NoApiKeyProvidedException();
      }
    }
  }

  async createEvent(event: Event) {
    await this.post(event, '/events');
  }

  async post(entity: any, path: string) {
    const { apiKey, apiHostname = API_HOSTNAME } = this.options;

    try {
      await axios.post(`https://${apiHostname}${path}`, entity, {
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
          default: {
            throw new InternalServerErrorException();
          }
        }
      }
    }
  }
}
