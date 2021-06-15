import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import { WorkOS } from './workos';
import {
  NoApiKeyProvidedException,
  NotFoundException,
  GenericServerException,
} from './common/exceptions';

const mock = new MockAdapater(axios);

describe('WorkOS', () => {
  describe('constructor', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      delete process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    describe('when no API key is provided', () => {
      it('throws a NoApiKeyFoundException error', async () => {
        expect(() => new WorkOS()).toThrowError(NoApiKeyProvidedException);
      });
    });

    describe('when API key is provided with environment variable', () => {
      it('initializes', async () => {
        process.env.WORKOS_API_KEY = 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU';
        expect(() => new WorkOS()).not.toThrow();
      });
    });

    describe('when API key is provided with constructor', () => {
      it('initializes', async () => {
        expect(
          () => new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU'),
        ).not.toThrow();
      });
    });

    describe('with https option', () => {
      it('sets baseURL', () => {
        const workos = new WorkOS('foo', { https: false });
        expect(workos.baseURL).toEqual('http://api.workos.com');
      });
    });

    describe('with apiHostname option', () => {
      it('sets baseURL', () => {
        const workos = new WorkOS('foo', { apiHostname: 'localhost' });
        expect(workos.baseURL).toEqual('https://localhost');
      });
    });

    describe('with port option', () => {
      it('sets baseURL', () => {
        const workos = new WorkOS('foo', {
          apiHostname: 'localhost',
          port: 4000,
        });
        expect(workos.baseURL).toEqual('https://localhost:4000');
      });
    });
  });

  describe('post', () => {
    describe('when the api responds with a 404', () => {
      it('throws a NotFoundException', async () => {
        mock.onPost().reply(
          404,
          {
            message: 'Not Found',
            error: 'error',
            error_description: 'error description',
          },
          { 'X-Request-ID': 'a-request-id' },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.post('/path', {})).rejects.toStrictEqual(
          new NotFoundException(
            '/path',
            'a-request-id',
            'error',
            'error description',
          ),
        );
      });
    });

    describe('when the api responds with a 500', () => {
      it('throws an GenericServerException', async () => {
        mock.onPost().reply(
          500,
          {},
          {
            'X-Request-ID': 'a-request-id',
            error: 'error',
            error_description: 'error description',
          },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.post('/path', {})).rejects.toStrictEqual(
          new GenericServerException(
            500,
            undefined,
            'a-request-id',
            'error',
            'error description',
          ),
        );
      });
    });
  });
});
