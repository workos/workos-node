import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import WorkOS from './workos';
import {
  InternalServerErrorException,
  NoApiKeyProvidedException,
  NotFoundException,
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

    describe('when no api key is provided', () => {
      it('throws a NoApiKeyFoundException', async () => {
        expect(() => new WorkOS()).toThrowError(NoApiKeyProvidedException);
      });
    });

    describe('when api key is provided with environment variable', () => {
      it('initializes', async () => {
        process.env.WORKOS_API_KEY = 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU';

        expect(() => new WorkOS()).not.toThrow();
      });
    });

    describe('when api key is provided with constructor', () => {
      it('constructs successfuly', async () => {
        expect(
          () => new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU'),
        ).not.toThrow();
      });
    });
  });

  describe('post', () => {
    describe('when the api responds with a 404', () => {
      it('throws a NotFoundException', async () => {
        mock.onPost().reply(404, { message: 'Not Found' });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.post({}, '/path')).rejects.toStrictEqual(
          new NotFoundException('/path'),
        );
      });
    });

    describe('when the api responds with a 500', () => {
      it('throws an InternalServerErrorException', async () => {
        mock.onPost().reply(500);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.post({}, '/path')).rejects.toStrictEqual(
          new InternalServerErrorException(),
        );
      });
    });
  });
});
