import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL, fetchBody } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import getAccessTokenSuccessFixture from './fixtures/get-access-token-success.json';
import getAccessTokenNoExpiryFixture from './fixtures/get-access-token-no-expiry.json';

describe('Pipes', () => {
  let workos: WorkOS;

  beforeAll(() => {
    workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
      apiHostname: 'api.workos.test',
      clientId: 'proj_123',
    });
  });

  beforeEach(() => fetch.resetMocks());

  describe('getAccessToken', () => {
    it('returns access token with expiry date', async () => {
      fetchOnce(getAccessTokenSuccessFixture);
      const response = await workos.pipes.getAccessToken({
        provider: 'test-provider',
        userId: 'user_123',
        organizationId: 'org_456',
      });

      expect(fetchURL()).toContain('/data-integrations/test-provider/token');
      expect(fetchBody()).toEqual({
        user_id: 'user_123',
        organization_id: 'org_456',
      });
      expect(response).toEqual({
        accessToken: {
          token: 'test_access_token_123',
          expiresAt: new Date('2025-10-18T12:00:00.000Z'),
          scopes: ['read:users', 'write:users'],
          missingScopes: [],
        },
      });
    });

    it('returns access token without expiry date', async () => {
      fetchOnce(getAccessTokenNoExpiryFixture);
      const response = await workos.pipes.getAccessToken({
        provider: 'test-provider',
        userId: 'user_789',
      });

      expect(fetchURL()).toContain('/data-integrations/test-provider/token');
      expect(fetchBody()).toEqual({
        user_id: 'user_789',
        organization_id: undefined,
      });
      expect(response).toEqual({
        accessToken: {
          token: 'test_access_token_456',
          expiresAt: null,
          scopes: ['read:data'],
          missingScopes: ['write:data'],
        },
      });
    });

    it('returns not_installed failure when integration is not installed', async () => {
      fetchOnce({}, { status: 404 });
      const response = await workos.pipes.getAccessToken({
        provider: 'test-provider',
        userId: 'user_123',
      });

      expect(fetchURL()).toContain('/data-integrations/test-provider/token');
      expect(response).toEqual({
        accessToken: null,
        reason: 'not_installed',
      });
    });

    it('throws error for non-404 errors', async () => {
      fetchOnce({ message: 'Internal Server Error' }, { status: 500 });

      await expect(
        workos.pipes.getAccessToken({
          provider: 'test-provider',
          userId: 'user_123',
        }),
      ).rejects.toThrow();
    });
  });
});
