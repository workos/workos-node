import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchHeaders, fetchBody } from './common/utils/test-utils';
import fs from 'fs/promises';
import {
  GenericServerException,
  NoApiKeyProvidedException,
  NotFoundException,
  OauthException,
} from './common/exceptions';
import { ParseError } from './common/exceptions/parse-error';
import { WorkOS } from './index';
import { WorkOS as WorkOSWorker } from './index.worker';
import { RateLimitExceededException } from './common/exceptions/rate-limit-exceeded.exception';
import { FetchHttpClient } from './common/net/fetch-client';
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';

describe('WorkOS', () => {
  beforeEach(() => fetch.resetMocks());

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
        delete process.env.WORKOS_API_KEY;
        expect(() => new WorkOS()).toThrow(NoApiKeyProvidedException);
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

    describe('when the `config` option is provided', () => {
      it('applies the configuration to the fetch client', async () => {
        fetchOnce('{}', { headers: { 'X-Request-ID': 'a-request-id' } });

        const workos = new WorkOS('sk_test', {
          config: {
            headers: {
              'X-My-Custom-Header': 'Hey there!',
            },
          },
        });

        await workos.post('/somewhere', {});

        expect(fetchHeaders()).toMatchObject({
          'X-My-Custom-Header': 'Hey there!',
        });
      });
    });

    describe('when the `appInfo` option is provided', () => {
      it('applies the configuration to the fetch client user-agent', async () => {
        fetchOnce('{}');

        const packageJson = JSON.parse(
          await fs.readFile('package.json', 'utf8'),
        );

        const workos = new WorkOS('sk_test', {
          appInfo: {
            name: 'fooApp',
            version: '1.0.0',
          },
        });

        await workos.post('/somewhere', {});

        expect(fetchHeaders()).toMatchObject({
          'User-Agent': `workos-node/${packageJson.version}/fetch fooApp: 1.0.0`,
        });
      });
    });

    describe('when no `appInfo` option is provided', () => {
      it('adds the HTTP client name to the user-agent', async () => {
        fetchOnce('{}');

        const packageJson = JSON.parse(
          await fs.readFile('package.json', 'utf8'),
        );

        const workos = new WorkOS('sk_test');

        await workos.post('/somewhere', {});

        expect(fetchHeaders()).toMatchObject({
          'User-Agent': `workos-node/${packageJson.version}/fetch`,
        });
      });
    });

    describe('when no `appInfo` option is provided', () => {
      it('adds the HTTP client name to the user-agent', async () => {
        fetchOnce('{}');

        const packageJson = JSON.parse(
          await fs.readFile('package.json', 'utf8'),
        );

        const workos = new WorkOS('sk_test');

        await workos.post('/somewhere', {});

        expect(fetchHeaders()).toMatchObject({
          'User-Agent': `workos-node/${packageJson.version}/fetch`,
        });
      });
    });

    describe('when using an environment that supports fetch', () => {
      it('automatically uses the fetch HTTP client', () => {
        const workos = new WorkOS('sk_test');

        // Bracket notation gets past private visibility
        // tslint:disable-next-line
        expect(workos['client']).toBeInstanceOf(FetchHttpClient);
      });
    });
  });

  describe('version', () => {
    it('matches the version in `package.json`', async () => {
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      // Read `package.json` using file I/O instead of `require` so we don't run
      // into issues with the `require` cache.
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));

      expect(workos.version).toBe(packageJson.version);
    });
  });

  describe('post', () => {
    describe('when the api responds with a 404', () => {
      it('throws a NotFoundException', async () => {
        const message = 'Not Found';
        fetchOnce(
          { message },
          { status: 404, headers: { 'X-Request-ID': 'a-request-id' } },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.post('/path', {})).rejects.toStrictEqual(
          new NotFoundException({
            message,
            path: '/path',
            requestID: 'a-request-id',
          }),
        );
      });

      it('preserves the error code, status, and message from the underlying response', async () => {
        const message = 'The thing you are looking for is not here.';
        const code = 'thing-not-found';
        fetchOnce(
          { code, message },
          { status: 404, headers: { 'X-Request-ID': 'a-request-id' } },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.post('/path', {})).rejects.toMatchObject({
          code,
          message,
          status: 404,
        });
      });

      it('includes the path in the message if there is no message in the response', async () => {
        const code = 'thing-not-found';
        const path = '/path/to/thing/that-aint-there';
        fetchOnce(
          { code },
          { status: 404, headers: { 'X-Request-ID': 'a-request-id' } },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.post(path, {})).rejects.toMatchObject({
          code,
          message: `The requested path '${path}' could not be found.`,
          status: 404,
        });
      });
    });

    describe('when the api responds with a 500 and no error/error_description', () => {
      it('throws an GenericServerException', async () => {
        fetchOnce(
          {},
          {
            status: 500,
            headers: { 'X-Request-ID': 'a-request-id' },
          },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.post('/path', {})).rejects.toStrictEqual(
          new GenericServerException(500, undefined, {}, 'a-request-id'),
        );
      });
    });

    describe('when the api responds with a 400 and an error/error_description', () => {
      it('throws an OauthException', async () => {
        fetchOnce(
          { error: 'error', error_description: 'error description' },
          {
            status: 400,
            headers: { 'X-Request-ID': 'a-request-id' },
          },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.post('/path', {})).rejects.toStrictEqual(
          new OauthException(
            400,
            'a-request-id',
            'error',
            'error description',
            { error: 'error', error_description: 'error description' },
          ),
        );
      });
    });

    describe('when the api responses with a 429', () => {
      it('throws a RateLimitExceededException', async () => {
        fetchOnce(
          {
            message: 'Too many requests',
          },
          {
            status: 429,
            headers: { 'X-Request-ID': 'a-request-id', 'Retry-After': '10' },
          },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.get('/path')).rejects.toStrictEqual(
          new RateLimitExceededException(
            'Too many requests',
            'a-request-id',
            10,
          ),
        );
      });
    });

    describe('when the entity is null', () => {
      it('sends an empty string body', async () => {
        fetchOnce();

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
        await workos.post('/somewhere', null);

        expect(fetchBody({ raw: true })).toBe('');
      });
    });

    describe('when the api responds with invalid JSON', () => {
      it('throws a ParseError', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          headers: new Headers({
            'X-Request-ID': 'a-request-id',
            'content-type': 'application/json',
          }),
          text: () => Promise.resolve('invalid json{'),
          json: () => Promise.reject(new SyntaxError('Invalid JSON')),
        };

        fetch.mockResolvedValueOnce(mockResponse as any);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const error = await workos.post('/path', {}).catch((e) => e);

        expect(error).toBeInstanceOf(ParseError);
        expect(error.rawBody).toBe('invalid json{');
        expect(error.requestID).toBe('a-request-id');
      });
    });
  });

  describe('get', () => {
    describe('when the api responds with invalid JSON', () => {
      it('throws a ParseError', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          headers: new Headers({
            'X-Request-ID': 'a-request-id',
            'content-type': 'application/json',
          }),
          text: () => Promise.resolve('malformed json}'),
          json: () => Promise.reject(new SyntaxError('Invalid JSON')),
        };

        fetch.mockResolvedValueOnce(mockResponse as any);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const error = await workos.get('/path').catch((e) => e);

        expect(error).toBeInstanceOf(ParseError);
        expect(error.rawBody).toBe('malformed json}');
        expect(error.requestID).toBe('a-request-id');
      });
    });
  });

  describe('put', () => {
    describe('when the api responds with invalid JSON', () => {
      it('throws a ParseError', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          headers: new Headers({
            'X-Request-ID': 'a-request-id',
            'content-type': 'application/json',
          }),
          text: () => Promise.resolve('broken json['),
          json: () => Promise.reject(new SyntaxError('Invalid JSON')),
        };

        fetch.mockResolvedValueOnce(mockResponse as any);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const error = await workos.put('/path', {}).catch((e) => e);

        expect(error).toBeInstanceOf(ParseError);
        expect(error.rawBody).toBe('broken json[');
        expect(error.requestID).toBe('a-request-id');
      });
    });
  });

  describe('when in a worker environment', () => {
    it('uses the worker client', () => {
      const workos = new WorkOSWorker('sk_test_key');

      // tslint:disable-next-line
      expect(workos['client']).toBeInstanceOf(FetchHttpClient);

      expect(
        // tslint:disable-next-line
        workos.webhooks['signatureProvider']['cryptoProvider'],
      ).toBeInstanceOf(SubtleCryptoProvider);

      expect(
        // tslint:disable-next-line
        workos.actions['signatureProvider']['cryptoProvider'],
      ).toBeInstanceOf(SubtleCryptoProvider);
    });

    it('uses console.warn to emit warnings', () => {
      const workos = new WorkOSWorker('sk_test_key');
      const warnSpy = jest.spyOn(console, 'warn');

      workos.emitWarning('foo');

      expect(warnSpy).toHaveBeenCalledWith('WorkOS: foo');
    });
  });

  describe('when in a node environment', () => {
    it('uses process.emitWarning to emit warnings', () => {
      const workos = new WorkOS('sk_test_key');
      const warnSpy = jest.spyOn(process, 'emitWarning');

      workos.emitWarning('foo');

      expect(warnSpy).toHaveBeenCalledWith('foo', 'WorkOS');
    });
  });
});
