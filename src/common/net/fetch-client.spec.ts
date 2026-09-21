import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL } from '../../common/utils/test-utils';
import { FetchHttpClient } from './fetch-client';
import { HttpClientError } from './http-client';
import { ParseError } from '../exceptions/parse-error';
import http from 'node:http';
import { AddressInfo } from 'node:net';

const fetchClient = new FetchHttpClient('https://test.workos.com', {
  headers: {
    Authorization: `Bearer sk_test`,
    'User-Agent': 'test-fetch-client',
  },
});

describe('Fetch client', () => {
  beforeEach(() => fetch.resetMocks());

  describe('fetchRequestWithRetry', () => {
    it('get for Vault path should call fetchRequestWithRetry and return response', async () => {
      fetchOnce({ data: 'response' });
      const mockFetchRequestWithRetry = jest.spyOn(
        FetchHttpClient.prototype as any,
        'fetchRequestWithRetry',
      );

      const response = await fetchClient.get('/vault/v1/kv', {});

      expect(mockFetchRequestWithRetry).toHaveBeenCalledTimes(1);
      expect(fetchURL()).toBe('https://test.workos.com/vault/v1/kv');
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('post for Vault path should call fetchRequestWithRetry and return response', async () => {
      fetchOnce({ data: 'response' });
      const mockFetchRequestWithRetry = jest.spyOn(
        FetchHttpClient.prototype as any,
        'fetchRequestWithRetry',
      );

      const response = await fetchClient.post('/vault/v1/kv', {}, {});

      expect(mockFetchRequestWithRetry).toHaveBeenCalledTimes(1);
      expect(fetchURL()).toBe('https://test.workos.com/vault/v1/kv');
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('put for Vault path should call fetchRequestWithRetry and return response', async () => {
      fetchOnce({ data: 'response' });
      const mockFetchRequestWithRetry = jest.spyOn(
        FetchHttpClient.prototype as any,
        'fetchRequestWithRetry',
      );

      const response = await fetchClient.put('/vault/v1/kv/secret', {}, {});

      expect(mockFetchRequestWithRetry).toHaveBeenCalledTimes(1);
      expect(fetchURL()).toBe('https://test.workos.com/vault/v1/kv/secret');
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('delete for Vault path should call fetchRequestWithRetry and return response', async () => {
      fetchOnce({ data: 'response' });
      const mockFetchRequestWithRetry = jest.spyOn(
        FetchHttpClient.prototype as any,
        'fetchRequestWithRetry',
      );

      const response = await fetchClient.delete('/vault/v1/kv/secret', {});

      expect(mockFetchRequestWithRetry).toHaveBeenCalledTimes(1);
      expect(fetchURL()).toBe('https://test.workos.com/vault/v1/kv/secret');
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('should retry request on 500 status code', async () => {
      fetchOnce(
        {},
        {
          status: 500,
        },
      );
      fetchOnce({ data: 'response' });
      const mockShouldRetryRequest = jest.spyOn(
        FetchHttpClient.prototype as any,
        'shouldRetryRequest',
      );
      const mockSleep = jest.spyOn(fetchClient, 'sleep');
      mockSleep.mockImplementation(() => Promise.resolve());

      const response = await fetchClient.get('/vault/v1/kv', {});

      expect(mockShouldRetryRequest).toHaveBeenCalledTimes(2);
      expect(mockSleep).toHaveBeenCalledTimes(1);
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('should retry request on 502 status code', async () => {
      fetchOnce(
        {},
        {
          status: 502,
        },
      );
      fetchOnce({ data: 'response' });
      const mockShouldRetryRequest = jest.spyOn(
        FetchHttpClient.prototype as any,
        'shouldRetryRequest',
      );
      const mockSleep = jest.spyOn(fetchClient, 'sleep');
      mockSleep.mockImplementation(() => Promise.resolve());

      const response = await fetchClient.get('/vault/v1/kv', {});

      expect(mockShouldRetryRequest).toHaveBeenCalledTimes(2);
      expect(mockSleep).toHaveBeenCalledTimes(1);
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('should retry request on 504 status code', async () => {
      fetchOnce(
        {},
        {
          status: 504,
        },
      );
      fetchOnce({ data: 'response' });
      const mockShouldRetryRequest = jest.spyOn(
        FetchHttpClient.prototype as any,
        'shouldRetryRequest',
      );
      const mockSleep = jest.spyOn(fetchClient, 'sleep');
      mockSleep.mockImplementation(() => Promise.resolve());

      const response = await fetchClient.get('/vault/v1/kv', {});

      expect(mockShouldRetryRequest).toHaveBeenCalledTimes(2);
      expect(mockSleep).toHaveBeenCalledTimes(1);
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('should retry request up to 3 times on retryable status code', async () => {
      fetchOnce(
        {},
        {
          status: 500,
        },
      );
      fetchOnce(
        {},
        {
          status: 502,
        },
      );
      fetchOnce(
        {},
        {
          status: 504,
        },
      );
      fetchOnce(
        {},
        {
          status: 504,
        },
      );
      const mockShouldRetryRequest = jest.spyOn(
        FetchHttpClient.prototype as any,
        'shouldRetryRequest',
      );
      const mockSleep = jest.spyOn(fetchClient, 'sleep');
      mockSleep.mockImplementation(() => Promise.resolve());

      await expect(fetchClient.get('/vault/v1/kv', {})).rejects.toThrow(
        'Gateway Timeout',
      );

      expect(mockShouldRetryRequest).toHaveBeenCalledTimes(4);
      expect(mockSleep).toHaveBeenCalledTimes(3);
    });

    it('should not retry requests and throw error with non-retryable status code', async () => {
      fetchOnce(
        {},
        {
          status: 400,
        },
      );
      const mockShouldRetryRequest = jest.spyOn(
        FetchHttpClient.prototype as any,
        'shouldRetryRequest',
      );

      await expect(fetchClient.get('/vault/v1/kv', {})).rejects.toThrow(
        'Bad Request',
      );

      expect(mockShouldRetryRequest).toHaveBeenCalledTimes(1);
    });

    it('should retry request on TypeError', async () => {
      fetchOnce({ data: 'response' });
      const mockFetchRequest = jest.spyOn(
        FetchHttpClient.prototype as any,
        'fetchRequest',
      );
      mockFetchRequest.mockImplementationOnce(() => {
        throw new TypeError('Network request failed');
      });
      const mockSleep = jest.spyOn(fetchClient, 'sleep');
      mockSleep.mockImplementation(() => Promise.resolve());

      const response = await fetchClient.get('/vault/v1/kv', {});

      expect(mockFetchRequest).toHaveBeenCalledTimes(2);
      expect(mockSleep).toHaveBeenCalledTimes(1);
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });
  });

  describe('error handling', () => {
    it('should throw ParseError when response body is not valid JSON on non-200 status', async () => {
      // Mock a 500 response with invalid JSON (like an HTML error page)
      fetch.mockResponseOnce(
        '<html><body>Internal Server Error</body></html>',
        {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {
            'X-Request-ID': 'test-request-123',
            'Content-Type': 'text/html',
          },
        },
      );

      await expect(
        fetchClient.get('/users', { maxRetries: 0 }),
      ).rejects.toThrow(ParseError);

      try {
        await fetchClient.get('/users', { maxRetries: 0 });
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        const parseError = error as ParseError;
        expect(parseError.message).toContain('Unexpected token');
        expect(parseError.rawBody).toBe(
          '<html><body>Internal Server Error</body></html>',
        );
        expect(parseError.requestID).toBe('test-request-123');
        expect(parseError.rawStatus).toBe(500);
      }
    });

    it('should throw ParseError for endpoints with invalid JSON response', async () => {
      fetch.mockResponseOnce('Not JSON content', {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'X-Request-ID': 'bad-request-456',
          'Content-Type': 'text/plain',
        },
      });

      await expect(
        fetchClient.post('/organizations', { name: 'Test' }, {}),
      ).rejects.toThrow(ParseError);

      try {
        await fetchClient.post('/organizations', { name: 'Test' }, {});
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        const parseError = error as ParseError;
        expect(parseError.rawBody).toBe('Not JSON content');
        expect(parseError.requestID).toBe('bad-request-456');
        expect(parseError.rawStatus).toBe(400);
      }
    });

    it('should throw ParseError on 200 with malformed JSON using real Response (GH-1621)', async () => {
      const client = new FetchHttpClient(
        'https://test.workos.com',
        {
          headers: {
            Authorization: 'Bearer sk_test',
            'User-Agent': 'test-fetch-client',
          },
        },
        async () =>
          new Response('{ invalid json', {
            status: 200,
            headers: {
              'content-type': 'application/json',
              'x-request-id': 'req_real_response',
            },
          }),
      );

      const res = await client.get('/users', {});
      const error = await res.toJSON().catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ParseError);
      const parseError = error as ParseError;
      expect(parseError.rawBody).toBe('{ invalid json');
      expect(parseError.requestID).toBe('req_real_response');
      expect(parseError.rawStatus).toBe(200);
    });

    it('should throw ParseError when X-Request-ID header is missing', async () => {
      fetch.mockResponseOnce('Invalid JSON Response', {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      try {
        await fetchClient.put('/users/123', { name: 'Updated' }, {});
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        const parseError = error as ParseError;
        expect(parseError.rawBody).toBe('Invalid JSON Response');
        expect(parseError.requestID).toBe(''); // Should default to empty string when header is missing
        expect(parseError.rawStatus).toBe(422);
      }
    });
  });
});

describe('automatic retries', () => {
  beforeEach(() => fetch.resetMocks());

  it('retries requests on non-vault paths by default', async () => {
    fetchOnce({}, { status: 500 });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    const response = await fetchClient.get('/organizations', {});

    expect(fetch.mock.calls.length).toBe(2);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('retries requests on a 429 status code', async () => {
    fetchOnce({}, { status: 429 });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    const response = await fetchClient.get('/organizations', {});

    expect(fetch.mock.calls.length).toBe(2);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('honors the Retry-After header (delay-seconds) when retrying', async () => {
    fetchOnce({}, { status: 429, headers: { 'Retry-After': '2' } });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await fetchClient.get('/organizations', {});

    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(mockSleep).toHaveBeenCalledWith(expect.any(Number), 2000);
  });

  it('attaches an Idempotency-Key to a retried POST that lacks one', async () => {
    fetchOnce({}, { status: 500 });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await fetchClient.post('/organizations', { name: 'Test' }, {});

    const firstHeaders = fetch.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    const secondHeaders = fetch.mock.calls[1][1]?.headers as Record<
      string,
      string
    >;
    expect(firstHeaders['Idempotency-Key']).toMatch(/^retry-/);
    expect(secondHeaders['Idempotency-Key']).toBe(
      firstHeaders['Idempotency-Key'],
    );
  });

  it('does not override a caller-provided Idempotency-Key on retry', async () => {
    fetchOnce({}, { status: 500 });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await fetchClient.post(
      '/organizations',
      { name: 'Test' },
      { headers: { 'Idempotency-Key': 'user-key' } },
    );

    const firstHeaders = fetch.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    const secondHeaders = fetch.mock.calls[1][1]?.headers as Record<
      string,
      string
    >;
    expect(firstHeaders['Idempotency-Key']).toBe('user-key');
    expect(secondHeaders['Idempotency-Key']).toBe('user-key');
  });

  it('retries a retryable status with a non-JSON error body', async () => {
    fetch.mockResponseOnce('<html>503 Service Unavailable</html>', {
      status: 503,
      headers: { 'content-type': 'text/html' },
    });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    const response = await fetchClient.get('/organizations', {});

    expect(fetch.mock.calls.length).toBe(2);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('honors Retry-After on a retryable non-JSON error body', async () => {
    fetch.mockResponseOnce('<html>503 Service Unavailable</html>', {
      status: 503,
      headers: { 'content-type': 'text/html', 'Retry-After': '7' },
    });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await fetchClient.get('/organizations', {});

    expect(fetch.mock.calls.length).toBe(2);
    expect(mockSleep).toHaveBeenCalledWith(expect.any(Number), 7000);
  });

  it('does not retry when maxRetries is 0', async () => {
    const client = new FetchHttpClient('https://test.workos.com', {
      maxRetries: 0,
    });
    fetchOnce({}, { status: 500 });

    await expect(client.get('/organizations', {})).rejects.toThrow();

    expect(fetch.mock.calls.length).toBe(1);
  });

  it('respects a per-request maxRetries override', async () => {
    fetchOnce({}, { status: 500 });
    fetchOnce({}, { status: 500 });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await expect(
      fetchClient.get('/organizations', { maxRetries: 1 }),
    ).rejects.toThrow();

    expect(fetch.mock.calls.length).toBe(2);
  });

  it('honors the Retry-After header (HTTP-date) when retrying', async () => {
    const fixedNow = 1_700_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);
    fetchOnce(
      {},
      {
        status: 429,
        headers: { 'Retry-After': new Date(fixedNow + 5_000).toUTCString() },
      },
    );
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await fetchClient.get('/organizations', {});

    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(mockSleep).toHaveBeenCalledWith(expect.any(Number), 5000);
  });

  it('caps a server-provided Retry-After delay at 60 seconds', async () => {
    fetchOnce({}, { status: 429, headers: { 'Retry-After': '3600' } });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await fetchClient.get('/organizations', {});

    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(mockSleep).toHaveBeenCalledWith(expect.any(Number), 60_000);
  });

  it('falls back to computed backoff when Retry-After is unparseable', async () => {
    fetchOnce({}, { status: 429, headers: { 'Retry-After': 'not-a-delay' } });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await fetchClient.get('/organizations', {});

    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(mockSleep).toHaveBeenCalledWith(expect.any(Number), null);
  });

  it('retries when the fetch function rejects with a network error', async () => {
    fetch.mockRejectOnce(new TypeError('Failed to fetch'));
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    const response = await fetchClient.get('/organizations', {});

    expect(fetch.mock.calls.length).toBe(2);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('retries DELETE requests on transient failures', async () => {
    fetchOnce({}, { status: 500 });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    const response = await fetchClient.delete('/organizations/org_123', {});

    expect(fetch.mock.calls.length).toBe(2);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('does not attach an Idempotency-Key to PUT or PATCH requests', async () => {
    fetchOnce({}, { status: 500 });
    fetchOnce({ data: 'response' });
    const mockSleep = jest.spyOn(fetchClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await fetchClient.put('/organizations/org_123', { name: 'Test' }, {});

    const putHeaders = fetch.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(putHeaders['Idempotency-Key']).toBeUndefined();

    fetch.resetMocks();
    fetchOnce({}, { status: 500 });
    fetchOnce({ data: 'response' });

    await fetchClient.patch('/organizations/org_123', { name: 'Test' }, {});

    const patchHeaders = fetch.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(patchHeaders['Idempotency-Key']).toBeUndefined();
  });
});

describe('FetchHttpClient with timeout', () => {
  let client: FetchHttpClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new FetchHttpClient(
      'https://api.example.com',
      { timeout: 100, maxRetries: 0 },
      mockFetch,
    );
  });

  it('should timeout requests that take too long', async () => {
    // Mock a fetch that respects AbortController
    mockFetch.mockImplementation((_, options) => {
      return new Promise((_, reject) => {
        if (options.signal) {
          options.signal.addEventListener('abort', () => {
            const error = new Error('AbortError');
            error.name = 'AbortError';
            reject(error);
          });
        }
        // Never resolve - let the timeout trigger
      });
    });

    await expect(client.post('/test', { data: 'test' }, {})).rejects.toThrow(
      HttpClientError,
    );

    // Reset the mock for the second test
    mockFetch.mockClear();
    mockFetch.mockImplementation((_, options) => {
      return new Promise((_, reject) => {
        if (options.signal) {
          options.signal.addEventListener('abort', () => {
            const error = new Error('AbortError');
            error.name = 'AbortError';
            reject(error);
          });
        }
        // Never resolve - let the timeout trigger
      });
    });

    await expect(
      client.post('/test', { data: 'test' }, {}),
    ).rejects.toMatchObject({
      message: 'Request timeout after 100ms',
      response: {
        status: 408,
        data: { error: 'Request timeout' },
      },
    });
  });

  it('should not timeout requests that complete quickly', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('{"success": true}'),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await client.post('/test', { data: 'test' }, {});
    expect(result).toBeDefined();
  });

  it('should work without timeout configured', async () => {
    const clientWithoutTimeout = new FetchHttpClient(
      'https://api.example.com',
      {},
      mockFetch,
    );

    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('{"success": true}'),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await clientWithoutTimeout.post(
      '/test',
      { data: 'test' },
      {},
    );
    expect(result).toBeDefined();
  });
});

describe('request timeout covers the response body (GH-1679)', () => {
  // `fetch` in this file is the jest-fetch-mock import.
  type FetchFn = typeof globalThis.fetch;

  type FakeAttempt = {
    signal: AbortSignal;
    response: any;
    failBody: (error: Error) => void;
    readonly textCalls: number;
  };

  type FakeAttemptPlan = {
    status?: number;
    headers?: Record<string, string>;
    /** `'pending'` to stall until the signal aborts, else the body. */
    body?: 'pending' | string;
    /** Delay before the headers resolve. */
    headersDelayMs?: number;
  };

  const abortError = () => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    return error;
  };

  /**
   * A fetch double that honours the abort signal the way real
   * implementations do: an abort rejects the pending headers or the pending
   * body read with an `AbortError`.
   */
  function createFakeFetch(plan: FakeAttemptPlan[]) {
    const attempts: FakeAttempt[] = [];

    const fetchFn = jest.fn((_url: string, init: RequestInit) => {
      const step = plan[Math.min(attempts.length, plan.length - 1)];
      const signal = init.signal as AbortSignal;
      const status = step.status ?? 200;
      const headers = new Headers({
        'content-type': 'application/json',
        'x-request-id': 'req_1679',
        ...step.headers,
      });

      let settleBody!: {
        resolve: (body: string) => void;
        reject: (error: Error) => void;
      };
      const bodyPromise = new Promise<string>((resolve, reject) => {
        settleBody = { resolve, reject };
      });
      bodyPromise.catch(() => undefined);
      signal.addEventListener('abort', () => settleBody.reject(abortError()));

      let textCalls = 0;
      const response = {
        ok: status < 400,
        status,
        statusText: status < 400 ? 'OK' : 'Error',
        headers,
        text: () => {
          textCalls++;
          return bodyPromise;
        },
      };

      if (step.body !== 'pending') {
        settleBody.resolve(step.body ?? '');
      }

      attempts.push({
        signal,
        response,
        failBody: settleBody.reject,
        get textCalls() {
          return textCalls;
        },
      });

      return new Promise<any>((resolve, reject) => {
        signal.addEventListener('abort', () => reject(abortError()));
        if (step.headersDelayMs) {
          setTimeout(() => resolve(response), step.headersDelayMs);
        } else {
          resolve(response);
        }
      });
    });

    return { fetchFn: fetchFn as unknown as FetchFn, attempts };
  }

  function createClient(
    plan: FakeAttemptPlan[],
    options: { maxRetries?: number; timeout?: number } = {},
  ) {
    const fake = createFakeFetch(plan);
    const client = new FetchHttpClient(
      'https://api.example.com',
      { timeout: 100, maxRetries: 0, ...options },
      fake.fetchFn,
    );
    return { client, ...fake };
  }

  function settledFlag(promise: Promise<unknown>) {
    const state = { settled: false };
    promise.then(
      () => (state.settled = true),
      () => (state.settled = true),
    );
    return state;
  }

  const timeout408 = {
    message: 'Request timeout after 100ms',
    response: { status: 408, data: { error: 'Request timeout' } },
  };

  describe('with deterministic timers', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('keeps the deadline armed after the headers arrive and fails a stalled JSON body with a 408', async () => {
      const { client, attempts } = createClient([{ body: 'pending' }]);

      const res = await client.get('/users', {});
      const read = res.toJSON();
      read.catch(() => undefined);
      const state = settledFlag(read);

      await jest.advanceTimersByTimeAsync(99);
      expect(state.settled).toBe(false);
      expect(attempts[0].signal.aborted).toBe(false);

      await jest.advanceTimersByTimeAsync(1);
      await expect(read).rejects.toThrow(HttpClientError);
      await expect(read).rejects.toMatchObject(timeout408);
      const error = await read.catch((e) => e);
      expect(error.response.headers.get('x-request-id')).toBe('req_1679');
      expect(attempts[0].signal.aborted).toBe(true);
      expect(attempts[0].textCalls).toBe(1);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('charges the wait for headers against the same deadline instead of restarting it', async () => {
      const { client } = createClient([
        { body: 'pending', headersDelayMs: 80 },
      ]);

      const request = client.get('/users', {});
      await jest.advanceTimersByTimeAsync(80);
      const res = await request;

      const read = res.toJSON();
      read.catch(() => undefined);
      const state = settledFlag(read);

      await jest.advanceTimersByTimeAsync(19);
      expect(state.settled).toBe(false);

      await jest.advanceTimersByTimeAsync(1);
      await expect(read).rejects.toMatchObject(timeout408);
    });

    it('does not retry a request whose successful body times out: the server has already applied it', async () => {
      const { client, fetchFn, attempts } = createClient(
        [{ body: 'pending' }],
        { maxRetries: 2 },
      );

      const res = await client.patch('/users/123', { name: 'x' }, {});
      const read = res.toJSON();
      read.catch(() => undefined);

      await jest.advanceTimersByTimeAsync(100);
      await expect(read).rejects.toMatchObject(timeout408);

      await jest.advanceTimersByTimeAsync(20_000);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(attempts).toHaveLength(1);
    });

    it('reads a stalled error body inside the attempt so Retry-After applies, with a fresh deadline per attempt', async () => {
      const { client, fetchFn, attempts } = createClient(
        [
          {
            status: 503,
            headers: { 'x-request-id': 'req_first', 'retry-after': '1' },
            body: 'pending',
          },
          { status: 200, body: '{"ok":true}' },
        ],
        { maxRetries: 1 },
      );

      const request = client.post('/users', { name: 'x' }, {});
      request.catch(() => undefined);

      await jest.advanceTimersByTimeAsync(100);
      expect(attempts[0].signal.aborted).toBe(true);
      expect(attempts[0].textCalls).toBe(1);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Retry-After from the aborted attempt's headers is honoured.
      await jest.advanceTimersByTimeAsync(999);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      await jest.advanceTimersByTimeAsync(1);
      expect(fetchFn).toHaveBeenCalledTimes(2);

      const res = await request;
      await expect(res.toJSON()).resolves.toEqual({ ok: true });

      const calls = (fetchFn as unknown as jest.Mock).mock.calls;
      expect(calls[0][1].headers['Idempotency-Key']).toBe(
        calls[1][1].headers['Idempotency-Key'],
      );

      await jest.advanceTimersByTimeAsync(10_000);
      expect(attempts[1].signal.aborted).toBe(false);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('surfaces a stalled error body as a 408 carrying the response headers once retries are exhausted', async () => {
      const { client, attempts } = createClient([
        {
          status: 422,
          headers: { 'x-request-id': 'req_422' },
          body: 'pending',
        },
      ]);

      const request = client.get('/users', {});
      request.catch(() => undefined);
      await jest.advanceTimersByTimeAsync(100);

      await expect(request).rejects.toMatchObject(timeout408);
      const error = await request.catch((e) => e);
      expect(error.response.headers.get('x-request-id')).toBe('req_422');
      expect(attempts[0].signal.aborted).toBe(true);
    });

    it('keeps a timeout before the headers on its existing path, including retries', async () => {
      const { client, fetchFn, attempts } = createClient(
        [{ body: 'pending', headersDelayMs: 500 }],
        { maxRetries: 1 },
      );

      const request = client.get('/users', {});
      request.catch(() => undefined);

      await jest.advanceTimersByTimeAsync(100);
      expect(attempts[0].signal.aborted).toBe(true);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Backoff (max 1687.5ms at attempt 2) then the second attempt's deadline.
      await jest.advanceTimersByTimeAsync(2000);
      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(attempts[1].signal.aborted).toBe(true);

      await expect(request).rejects.toMatchObject(timeout408);
      const error = await request.catch((e) => e);
      expect(error.response.headers.get('x-request-id')).toBeNull();
    });

    it('still reports a complete but malformed JSON body as a ParseError and releases the deadline', async () => {
      const { client, attempts } = createClient([{ body: '{ invalid' }]);

      const res = await client.get('/users', {});
      const error = await res.toJSON().catch((e) => e);

      expect(error).toBeInstanceOf(ParseError);
      expect(error.rawBody).toBe('{ invalid');
      expect(error.rawStatus).toBe(200);
      expect(error.requestID).toBe('req_1679');
      expect(jest.getTimerCount()).toBe(0);

      await jest.advanceTimersByTimeAsync(10_000);
      expect(attempts[0].signal.aborted).toBe(false);
    });

    it('propagates a body failure that is not a timeout unchanged and does not retry it', async () => {
      const { client, fetchFn, attempts } = createClient(
        [{ body: 'pending' }],
        {
          maxRetries: 2,
        },
      );

      const res = await client.get('/users', {});
      const read = res.toJSON();
      read.catch(() => undefined);
      attempts[0].failBody(new TypeError('terminated'));

      await expect(read).rejects.toThrow(TypeError);
      await expect(read).rejects.toThrow('terminated');
      await expect(read).rejects.not.toBeInstanceOf(HttpClientError);
      expect(jest.getTimerCount()).toBe(0);

      await jest.advanceTimersByTimeAsync(10_000);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(attempts[0].signal.aborted).toBe(false);
    });

    it('delivers a body that completes in time, releases the deadline and keeps the original response reachable', async () => {
      const { client, attempts } = createClient([{ body: '{"ok":true}' }]);

      const res = await client.get('/users', {});
      await expect(res.toJSON()).resolves.toEqual({ ok: true });
      expect(jest.getTimerCount()).toBe(0);
      expect(res.getRawResponse()).toBe(attempts[0].response);

      await jest.advanceTimersByTimeAsync(10_000);
      expect(attempts[0].signal.aborted).toBe(false);
    });

    it('drains a non-JSON body inside the deadline and still reports it as null', async () => {
      const { client, attempts } = createClient([
        { headers: { 'content-type': 'text/plain' }, body: 'hello' },
      ]);

      const res = await client.get('/users', {});
      await expect(res.toJSON()).resolves.toBeNull();
      expect(attempts[0].textCalls).toBe(1);

      await jest.advanceTimersByTimeAsync(0);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('bounds a stalled body that nobody reads without failing the call', async () => {
      const { client, attempts } = createClient([{ body: 'pending' }]);

      await client.delete('/users/123', {});
      expect(attempts[0].textCalls).toBe(1);
      expect(jest.getTimerCount()).toBe(1);

      await jest.advanceTimersByTimeAsync(100);
      expect(attempts[0].signal.aborted).toBe(true);
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  // Captured in setup-jest.ts before jest-fetch-mock replaces the global.
  const nativeFetch = (globalThis as Record<string, unknown>)
    .__workosNativeFetch as FetchFn;
  // jest-fetch-mock registers a mock for the 'node-fetch' module id.
  const nodeFetch = jest.requireActual('node-fetch') as FetchFn;

  describe.each([
    ['native fetch', nativeFetch],
    ['node-fetch', nodeFetch],
  ])('over real HTTP with %s', (_name, fetchImpl) => {
    let server: http.Server;
    let baseURL: string;
    let handler: (req: http.IncomingMessage, res: http.ServerResponse) => void;
    let requestCount: number;
    const openResponses: http.ServerResponse[] = [];

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    function stallBody(status: number, head = '{"ok":') {
      handler = (_req, res) => {
        res.writeHead(status, {
          'content-type': 'application/json',
          'x-request-id': 'req_real',
          'retry-after': '0',
        });
        res.write(head);
        // Hold the body open until the test tears the connection down.
      };
    }

    function respond(status: number, body: string) {
      handler = (_req, res) => {
        res.writeHead(status, {
          'content-type': 'application/json',
          'x-request-id': 'req_real',
          'retry-after': '0',
        });
        res.end(body);
      };
    }

    function createClient(maxRetries = 0) {
      const signals: AbortSignal[] = [];
      const rawResponses: Response[] = [];
      const fetchFn: FetchFn = async (url, init) => {
        signals.push(init!.signal as AbortSignal);
        const response = await fetchImpl(url, init);
        rawResponses.push(response);
        return response;
      };
      const client = new FetchHttpClient(
        baseURL,
        { timeout: 100, maxRetries },
        fetchFn,
      );
      return { client, signals, rawResponses };
    }

    beforeAll(async () => {
      server = http.createServer((req, res) => {
        requestCount++;
        openResponses.push(res);
        handler(req, res);
      });
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve),
      );
      const { port } = server.address() as AddressInfo;
      baseURL = `http://127.0.0.1:${port}`;
    });

    afterAll(async () => {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    });

    beforeEach(() => {
      requestCount = 0;
    });

    afterEach(() => {
      for (const res of openResponses) {
        res.destroy();
      }
      openResponses.length = 0;
    });

    it('times out a successful JSON body that stalls after the headers', async () => {
      stallBody(200);
      const { client, signals } = createClient();

      const res = await client.get('/users', {});
      expect(res.getStatusCode()).toBe(200);

      const error = await res.toJSON().catch((e) => e);
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error).toMatchObject(timeout408);
      expect(error.response.headers.get('x-request-id')).toBe('req_real');
      expect(signals[0].aborted).toBe(true);
      expect(requestCount).toBe(1);
    });

    it('does not retry a successful body that times out, even when retries are enabled', async () => {
      stallBody(200);
      const { client } = createClient(2);

      const res = await client.patch('/users/123', { name: 'x' }, {});
      await expect(res.toJSON()).rejects.toMatchObject(timeout408);

      // Retry-After is 0, so a retry would already have been sent.
      await sleep(50);
      expect(requestCount).toBe(1);
    });

    it('times out a stalled error body inside the attempt and retries it with a fresh deadline', async () => {
      // First attempt stalls its 503 body; the retry gets a clean 200.
      handler = (_req, res) => {
        if (requestCount === 1) {
          res.writeHead(503, {
            'content-type': 'application/json',
            'retry-after': '0',
          });
          res.write('{"error":');
          return;
        }
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{"ok":true}');
      };
      const { client, signals } = createClient(1);

      const res = await client.get('/users', {});
      await expect(res.toJSON()).resolves.toEqual({ ok: true });
      expect(requestCount).toBe(2);
      expect(signals[0].aborted).toBe(true);
      expect(signals[1].aborted).toBe(false);
    });

    it('surfaces a stalled error body as a 408 carrying the response headers when not retried', async () => {
      stallBody(422);
      const { client, signals } = createClient();

      const error = await client.get('/users', {}).catch((e) => e);
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error).toMatchObject(timeout408);
      expect(error.response.headers.get('x-request-id')).toBe('req_real');
      expect(signals[0].aborted).toBe(true);
    });

    it('delivers a body that completes in time and disarms the deadline', async () => {
      respond(200, '{"ok":true}');
      const { client, signals } = createClient();

      const res = await client.get('/users', {});
      await expect(res.toJSON()).resolves.toEqual({ ok: true });

      await sleep(150);
      expect(signals[0].aborted).toBe(false);
    });

    it('reports a connection dropped mid-body before the deadline as its own error', async () => {
      handler = (_req, res) => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.write('{"ok":');
        setTimeout(() => res.destroy(), 10);
      };
      const { client } = createClient();

      const res = await client.get('/users', {});
      const error = await res.toJSON().catch((e) => e);
      // The implementation's own error (undici raises it in Jest's outer
      // realm, so no instanceof Error here), not a timeout or parse error.
      expect(typeof error.message).toBe('string');
      expect(error).not.toBeInstanceOf(HttpClientError);
      expect(error).not.toBeInstanceOf(ParseError);
      expect(error.name).not.toBe('AbortError');
    });

    it("hands back the implementation's own response, with the body read by the SDK", async () => {
      respond(200, '{}');
      const { client, rawResponses, signals } = createClient();

      const res = await client.delete('/users/123', {});
      expect(res.getRawResponse()).toBe(rawResponses[0]);
      expect(rawResponses[0].bodyUsed).toBe(true);

      await sleep(150);
      expect(signals[0].aborted).toBe(false);
    });
  });
});
