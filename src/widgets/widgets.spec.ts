import fetch from 'jest-fetch-mock';
import { WorkOS } from '../workos';
import { fetchOnce, fetchURL } from '../common/utils/test-utils';
import tokenFixture from './fixtures/token.json';
import getTokenErrorFixture from './fixtures/get-token-error.json';

describe('Widgets', () => {
  let workos: WorkOS;

  beforeAll(() => {
    workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
      apiHostname: 'api.workos.test',
      clientId: 'proj_123',
    });
  });

  beforeEach(() => fetch.resetMocks());
  describe('getToken', () => {
    it('sends a Get Token request', async () => {
      fetchOnce(tokenFixture);
      const token = await workos.widgets.getToken({
        organizationId: 'org_123',
        userId: 'user_123',
        scopes: ['widgets:users-table:manage'],
      });
      expect(fetchURL()).toContain('/widgets/token');
      expect(token).toEqual('this.is.a.token');
    });

    it('returns an error if the API returns an error', async () => {
      fetchOnce(getTokenErrorFixture, { status: 404 });
      await expect(
        workos.widgets.getToken({
          organizationId: 'org_123',
          userId: 'user_123',
          scopes: ['widgets:users-table:manage'],
        }),
      ).rejects.toThrow("User not found 'user_123'");
    });
  });
});
