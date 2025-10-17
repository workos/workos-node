import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL, fetchBody } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import getAccessTokenSuccessFixture from './fixtures/get-access-token-success.json';
import getAccessTokenNoExpiryFixture from './fixtures/get-access-token-no-expiry.json';
import getAccessTokenNotInstalledFixture from './fixtures/get-access-token-not-installed.json';
import getAccessTokenNeedsReauthFixture from './fixtures/get-access-token-needs-reauth.json';

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
        active: true,
        accessToken: {
          object: 'access_token',
          accessToken: 'test_access_token_123',
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
        active: true,
        accessToken: {
          object: 'access_token',
          accessToken: 'test_access_token_456',
          expiresAt: null,
          scopes: ['read:data'],
          missingScopes: ['write:data'],
        },
      });
    });

    it('returns not_installed failure when integration is not installed', async () => {
      fetchOnce(getAccessTokenNotInstalledFixture);
      const response = await workos.pipes.getAccessToken({
        provider: 'test-provider',
        userId: 'user_123',
      });

      expect(fetchURL()).toContain('/data-integrations/test-provider/token');
      expect(response).toEqual({
        active: false,
        error: 'not_installed',
      });
    });

    it('returns needs_reauthorization failure when token needs refresh', async () => {
      fetchOnce(getAccessTokenNeedsReauthFixture);
      const response = await workos.pipes.getAccessToken({
        provider: 'test-provider',
        userId: 'user_123',
      });

      expect(fetchURL()).toContain('/data-integrations/test-provider/token');
      expect(response).toEqual({
        active: false,
        error: 'needs_reauthorization',
      });
    });

    it('throws error for server errors', async () => {
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
