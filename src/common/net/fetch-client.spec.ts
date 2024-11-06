import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL } from '../../common/utils/test-utils';
import { FetchHttpClient } from './fetch-client';

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
});
