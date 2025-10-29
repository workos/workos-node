import nock from 'nock';
import { NodeHttpClient } from './node-client';

const nodeClient = new NodeHttpClient('https://test.workos.com', {
  headers: {
    Authorization: `Bearer sk_test`,
    'User-Agent': 'test-node-client',
  },
});

describe('Node client', () => {
  beforeEach(() => nock.cleanAll());

  it('get for FGA path should call nodeRequestWithRetry and return response', async () => {
    nock('https://test.workos.com')
      .get('/fga/v1/resources')
      .reply(200, { data: 'response' });
    const mockNodeRequestWithRetry = jest.spyOn(
      NodeHttpClient.prototype as any,
      'nodeRequestWithRetry',
    );

    const response = await nodeClient.get('/fga/v1/resources', {});

    expect(mockNodeRequestWithRetry).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('post for FGA path should call nodeRequestWithRetry and return response', async () => {
    nock('https://test.workos.com')
      .post('/fga/v1/resources')
      .reply(200, { data: 'response' });
    const mockNodeRequestWithRetry = jest.spyOn(
      NodeHttpClient.prototype as any,
      'nodeRequestWithRetry',
    );

    const response = await nodeClient.post('/fga/v1/resources', {}, {});

    expect(mockNodeRequestWithRetry).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('put for FGA path should call nodeRequestWithRetry and return response', async () => {
    nock('https://test.workos.com')
      .put('/fga/v1/resources/user/user-1')
      .reply(200, { data: 'response' });
    const mockNodeRequestWithRetry = jest.spyOn(
      NodeHttpClient.prototype as any,
      'nodeRequestWithRetry',
    );

    const response = await nodeClient.put(
      '/fga/v1/resources/user/user-1',
      {},
      {},
    );

    expect(mockNodeRequestWithRetry).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('delete for FGA path should call nodeRequestWithRetry and return response', async () => {
    nock('https://test.workos.com')
      .delete('/fga/v1/resources/user/user-1')
      .reply(200, { data: 'response' });
    const mockNodeRequestWithRetry = jest.spyOn(
      NodeHttpClient.prototype as any,
      'nodeRequestWithRetry',
    );

    const response = await nodeClient.delete(
      '/fga/v1/resources/user/user-1',
      {},
    );

    expect(mockNodeRequestWithRetry).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('get for Vault path should call nodeRequestWithRetry and return response', async () => {
    nock('https://test.workos.com')
      .get('/vault/v1/kv')
      .reply(200, { data: 'response' });
    const mockNodeRequestWithRetry = jest.spyOn(
      NodeHttpClient.prototype as any,
      'nodeRequestWithRetry',
    );

    const response = await nodeClient.get('/vault/v1/kv', {});

    expect(mockNodeRequestWithRetry).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('post for Vault path should call nodeRequestWithRetry and return response', async () => {
    nock('https://test.workos.com')
      .post('/vault/v1/kv')
      .reply(200, { data: 'response' });
    const mockNodeRequestWithRetry = jest.spyOn(
      NodeHttpClient.prototype as any,
      'nodeRequestWithRetry',
    );

    const response = await nodeClient.post('/vault/v1/kv', {}, {});

    expect(mockNodeRequestWithRetry).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('put for Vault path should call nodeRequestWithRetry and return response', async () => {
    nock('https://test.workos.com')
      .put('/vault/v1/kv/secret')
      .reply(200, { data: 'response' });
    const mockNodeRequestWithRetry = jest.spyOn(
      NodeHttpClient.prototype as any,
      'nodeRequestWithRetry',
    );

    const response = await nodeClient.put('/vault/v1/kv/secret', {}, {});

    expect(mockNodeRequestWithRetry).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('delete for Vault path should call nodeRequestWithRetry and return response', async () => {
    nock('https://test.workos.com')
      .delete('/vault/v1/kv/secret')
      .reply(200, { data: 'response' });
    const mockNodeRequestWithRetry = jest.spyOn(
      NodeHttpClient.prototype as any,
      'nodeRequestWithRetry',
    );

    const response = await nodeClient.delete('/vault/v1/kv/secret', {});

    expect(mockNodeRequestWithRetry).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('should retry request on 500 status code', async () => {
    nock('https://test.workos.com')
      .get('/fga/v1/resources')
      .reply(500)
      .get('/fga/v1/resources')
      .reply(200, { data: 'response' });
    const mockShouldRetryRequest = jest.spyOn(
      NodeHttpClient.prototype as any,
      'shouldRetryRequest',
    );
    const mockSleep = jest.spyOn(nodeClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    const response = await nodeClient.get('/fga/v1/resources', {});

    expect(mockShouldRetryRequest).toHaveBeenCalledTimes(2);
    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('should retry request on 502 status code', async () => {
    nock('https://test.workos.com')
      .get('/fga/v1/resources')
      .reply(502)
      .get('/fga/v1/resources')
      .reply(200, { data: 'response' });
    const mockShouldRetryRequest = jest.spyOn(
      NodeHttpClient.prototype as any,
      'shouldRetryRequest',
    );
    const mockSleep = jest.spyOn(nodeClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    const response = await nodeClient.get('/fga/v1/resources', {});

    expect(mockShouldRetryRequest).toHaveBeenCalledTimes(2);
    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('should retry request on 504 status code', async () => {
    nock('https://test.workos.com')
      .get('/fga/v1/resources')
      .reply(504)
      .get('/fga/v1/resources')
      .reply(200, { data: 'response' });
    const mockShouldRetryRequest = jest.spyOn(
      NodeHttpClient.prototype as any,
      'shouldRetryRequest',
    );
    const mockSleep = jest.spyOn(nodeClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    const response = await nodeClient.get('/fga/v1/resources', {});

    expect(mockShouldRetryRequest).toHaveBeenCalledTimes(2);
    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });

  it('should retry request up to 3 times on retryable status code', async () => {
    nock('https://test.workos.com')
      .get('/fga/v1/resources')
      .reply(504)
      .get('/fga/v1/resources')
      .reply(502)
      .get('/fga/v1/resources')
      .reply(500)
      .get('/fga/v1/resources')
      .reply(500);
    const mockShouldRetryRequest = jest.spyOn(
      NodeHttpClient.prototype as any,
      'shouldRetryRequest',
    );
    const mockSleep = jest.spyOn(nodeClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    await expect(
      nodeClient.get('/fga/v1/resources', {}),
    ).rejects.toThrowError();

    expect(mockShouldRetryRequest).toHaveBeenCalledTimes(4);
    expect(mockSleep).toHaveBeenCalledTimes(3);
  });

  it('should not retry request on non-retryable status code', async () => {
    nock('https://test.workos.com').get('/fga/v1/resources').reply(400);
    const mockShouldRetryRequest = jest.spyOn(
      NodeHttpClient.prototype as any,
      'shouldRetryRequest',
    );

    await expect(
      nodeClient.get('/fga/v1/resources', {}),
    ).rejects.toThrowError();

    expect(mockShouldRetryRequest).toHaveBeenCalledTimes(1);
  });

  it('should retry request on TypeError', async () => {
    nock('https://test.workos.com')
      .get('/fga/v1/resources')
      .replyWithError(new TypeError('Network request failed'))
      .get('/fga/v1/resources')
      .reply(200, { data: 'response' });
    const mockShouldRetryRequest = jest.spyOn(
      NodeHttpClient.prototype as any,
      'shouldRetryRequest',
    );
    const mockSleep = jest.spyOn(nodeClient, 'sleep');
    mockSleep.mockImplementation(() => Promise.resolve());

    const response = await nodeClient.get('/fga/v1/resources', {});

    expect(mockShouldRetryRequest).toHaveBeenCalledTimes(1);
    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(await response.toJSON()).toEqual({ data: 'response' });
  });
});
