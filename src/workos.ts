import axios, { AxiosError } from 'axios';

import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from './common/exceptions';
import { WorkOSOptions, Event } from './common/interfaces';
import { version } from '../package.json';

export default class WorkOS {
  private readonly options: WorkOSOptions;

  constructor(options: WorkOSOptions) {
    this.options = options;
  }

  async createEvent(event: Event) {
    await this.post(event, '/events');
  }

  async post(entity: any, path: string) {
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
