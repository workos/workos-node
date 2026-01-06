import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import validateApiKeyFixture from './fixtures/validate-api-key.json';

describe('ApiKeys', () => {
  let workos: WorkOS;

  beforeAll(() => {
    workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
      apiHostname: 'api.workos.test',
      clientId: 'proj_123',
    });
  });

  beforeEach(() => fetch.resetMocks());

  describe('validateApiKey', () => {
    it('sends a validate API key request', async () => {
      fetchOnce(validateApiKeyFixture);
      const response = await workos.apiKeys.validateApiKey({
        value: 'sk_123',
      });

      expect(fetchURL()).toContain('/api_keys/validations');
      expect(response).toEqual({
        apiKey: {
          object: 'api_key',
          id: 'api_key_01H5JQDV7R7ATEYZDEG0W5PRYS',
          owner: {
            type: 'organization',
            id: 'org_01H5JQDV7R7ATEYZDEG0W5PRYS',
          },
          name: 'Test Api Key',
          obfuscatedValue: 'sk_…PRYS',
          lastUsedAt: null,
          permissions: ['read', 'write'],
          createdAt: '2023-07-18T02:07:19.911Z',
          updatedAt: '2023-07-18T02:07:19.911Z',
        },
      });
    });

    it('returns null if key is invalid', async () => {
      fetchOnce({ api_key: null });
      const response = await workos.apiKeys.validateApiKey({
        value: 'invalid',
      });

      expect(fetchURL()).toContain('/api_keys/validations');
      expect(response).toEqual({ apiKey: null });
    });
  });

  describe('deleteApiKey', () => {
    it('sends a delete request', async () => {
      fetchOnce({}, { status: 204 });

      await workos.apiKeys.deleteApiKey('api_key_01H5JQDV7R7ATEYZDEG0W5PRYS');

      expect(fetchURL()).toContain(
        '/api_keys/api_key_01H5JQDV7R7ATEYZDEG0W5PRYS',
      );
    });
  });
});
