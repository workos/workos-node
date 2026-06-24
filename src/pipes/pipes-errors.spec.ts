// Hand-written supplement to the generated pipes.spec.ts. The generated suite
// now covers getAccessToken's happy path, the `active: false` branch (asserting
// the discriminator), and the error-throw path. Two gaps the generator can't
// reach remain here: the second failure enum value — the generated branch test
// only emits the first (`not_installed`) and asserts the discriminator, not the
// deserialized `error` field — and the null-expiry success path, which is a
// nullable field rather than a union branch. Keep this file hand-owned (distinct
// name) so `regenerateOwnedTests` does not overwrite it.
import fetch from 'jest-fetch-mock';
import { fetchOnce } from '../common/utils/test-utils';
import { WorkOS } from '../workos';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Pipes getAccessToken inactive responses', () => {
  beforeEach(() => fetch.resetMocks());

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
