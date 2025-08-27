import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL } from '../../common/utils/test-utils';
import { FetchHttpClient } from './fetch-client';
import { HttpClientError } from './http-client';
import { ParseError } from '../exceptions/parse-error';

const fetchClient = new FetchHttpClient('https://test.workos.com', {
  headers: {
    Authorization: `Bearer sk_test`,
    'User-Agent': 'test-fetch-client',
  },
});

describe('Fetch client', () => {
  beforeEach(() => fetch.resetMocks());

  describe('fetchRequestWithRetry', () => {
    it('get for FGA path should call fetchRequestWithRetry and return response', async () => {
      fetchOnce({ data: 'response' });
      const mockFetchRequestWithRetry = jest.spyOn(
        FetchHttpClient.prototype as any,
        'fetchRequestWithRetry',
      );

      const response = await fetchClient.get('/fga/v1/resources', {});

      expect(mockFetchRequestWithRetry).toHaveBeenCalledTimes(1);
      expect(fetchURL()).toBe('https://test.workos.com/fga/v1/resources');
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('post for FGA path should call fetchRequestWithRetry and return response', async () => {
      fetchOnce({ data: 'response' });
      const mockFetchRequestWithRetry = jest.spyOn(
        FetchHttpClient.prototype as any,
        'fetchRequestWithRetry',
      );

      const response = await fetchClient.post('/fga/v1/resources', {}, {});

      expect(mockFetchRequestWithRetry).toHaveBeenCalledTimes(1);
      expect(fetchURL()).toBe('https://test.workos.com/fga/v1/resources');
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('put for FGA path should call fetchRequestWithRetry and return response', async () => {
      fetchOnce({ data: 'response' });
      const mockFetchRequestWithRetry = jest.spyOn(
        FetchHttpClient.prototype as any,
        'fetchRequestWithRetry',
      );

      const response = await fetchClient.put(
        '/fga/v1/resources/user/user-1',
        {},
        {},
      );

      expect(mockFetchRequestWithRetry).toHaveBeenCalledTimes(1);
      expect(fetchURL()).toBe(
        'https://test.workos.com/fga/v1/resources/user/user-1',
      );
      expect(await response.toJSON()).toEqual({ data: 'response' });
    });

    it('delete for FGA path should call fetchRequestWithRetry and return response', async () => {
      fetchOnce({ data: 'response' });
      const mockFetchRequestWithRetry = jest.spyOn(
        FetchHttpClient.prototype as any,
        'fetchRequestWithRetry',
      );

      const response = await fetchClient.delete(
        '/fga/v1/resources/user/user-1',
        {},
      );

      expect(mockFetchRequestWithRetry).toHaveBeenCalledTimes(1);
      expect(fetchURL()).toBe(
        'https://test.workos.com/fga/v1/resources/user/user-1',
      );
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

      const response = await fetchClient.get('/fga/v1/resources', {});

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

      const response = await fetchClient.get('/fga/v1/resources', {});

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

      const response = await fetchClient.get('/fga/v1/resources', {});

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

      await expect(
        fetchClient.get('/fga/v1/resources', {}),
      ).rejects.toThrowError('Gateway Timeout');

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

      await expect(
        fetchClient.get('/fga/v1/resources', {}),
      ).rejects.toThrowError('Bad Request');

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

      const response = await fetchClient.get('/fga/v1/resources', {});

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

      await expect(fetchClient.get('/users', {})).rejects.toThrow(ParseError);

      try {
        await fetchClient.get('/users', {});
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

    it('should throw ParseError for non-FGA endpoints with invalid JSON response', async () => {
      // Test with a non-FGA endpoint to ensure the error handling works for regular requests too
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

describe('FetchHttpClient with timeout', () => {
  let client: FetchHttpClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new FetchHttpClient('https://api.example.com', { timeout: 100 }, mockFetch);
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

    await expect(
      client.post('/test', { data: 'test' }, {})
    ).rejects.toThrow(HttpClientError);

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
      client.post('/test', { data: 'test' }, {})
    ).rejects.toMatchObject({
      message: 'Request timeout after 100ms',
      response: {
        status: 408,
        data: { error: 'Request timeout' }
      }
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
    const clientWithoutTimeout = new FetchHttpClient('https://api.example.com', {}, mockFetch);
    
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('{"success": true}'),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await clientWithoutTimeout.post('/test', { data: 'test' }, {});
    expect(result).toBeDefined();
  });
}); 
