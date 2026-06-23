// Hand-written supplement to the generated pipes.spec.ts. The generated test
// only exercises getAccessToken's happy path, leaving the `active: false`
// branches of the DataIntegrationAccessTokenResponse union — and the
// null-expiry success path — untested. Keep this file hand-owned (distinct
// name) so `regenerateOwnedTests` does not overwrite it.
import fetch from 'jest-fetch-mock';
import { fetchOnce } from '../common/utils/test-utils';
import { WorkOS } from '../workos';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Pipes getAccessToken inactive responses', () => {
  beforeEach(() => fetch.resetMocks());

  it('deserializes a not_installed error response', async () => {
    fetchOnce({ active: false, error: 'not_installed' });

    const result = await workos.pipes.getAccessToken({
      provider: 'test_provider',
      userId: 'user_id_01234',
    });

    expect(result).toEqual({ active: false, error: 'not_installed' });
  });

  it('deserializes a needs_reauthorization error response', async () => {
    fetchOnce({ active: false, error: 'needs_reauthorization' });

    const result = await workos.pipes.getAccessToken({
      provider: 'test_provider',
      userId: 'user_id_01234',
    });

    expect(result).toEqual({ active: false, error: 'needs_reauthorization' });
  });

  it('deserializes a success response without an expiry date', async () => {
    fetchOnce({
      active: true,
      access_token: {
        object: 'access_token',
        access_token: 'test_access_token',
        expires_at: null,
        scopes: ['read:data'],
        missing_scopes: [],
      },
    });

    const result = await workos.pipes.getAccessToken({
      provider: 'test_provider',
      userId: 'user_id_01234',
    });

    expect(result).toEqual({
      active: true,
      accessToken: {
        object: 'access_token',
        accessToken: 'test_access_token',
        expiresAt: null,
        scopes: ['read:data'],
        missingScopes: [],
      },
    });
  });
});
