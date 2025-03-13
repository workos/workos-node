import fetch from 'jest-fetch-mock';
import { fetchMethod, fetchOnce, fetchURL } from '../common/utils/test-utils';

import { WorkOS } from '../workos';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Vault', () => {
  beforeEach(() => fetch.resetMocks());

  describe('createSecret', () => {
    it('creates secret', async () => {
      const secretName = 'charger';
      fetchOnce({
        id: '05c04354-8d59-4a30-b5aa-ba442bd13ccb',
        context: {
          type: 'spore',
        },
        environment_id: 'xxx',
        key_id: '26c6539e-ea87-57a9-b2ea-ee9712d1caa1',
        updated_at: '2025-03-12T04:37:46.748303Z',
        version_id: '1bJ6LYclPpeAZSfhHa.RhG0F_ByUZUH6',
      });
      const resource = await workos.vault.createSecret({
        name: secretName,
        context: { type: 'spore' },
        value: 'Full speed ahead',
      });
      expect(fetchURL()).toContain(`/vault/v1/kv/${secretName}`);
      expect(fetchMethod()).toBe('POST');
      expect(resource).toMatchObject({
        id: '05c04354-8d59-4a30-b5aa-ba442bd13ccb',
        context: {
          type: 'spore',
        },
        environmentId: 'xxx',
        keyId: '26c6539e-ea87-57a9-b2ea-ee9712d1caa1',
        updatedAt: new Date(Date.parse('2025-03-12T04:37:46.748303Z')),
        versionId: '1bJ6LYclPpeAZSfhHa.RhG0F_ByUZUH6',
      });
    });
  });

  describe('readSecret', () => {
    it('reads a secret by name', async () => {
      const secretName = 'lima';
      const secretId = 'secret1';
      fetchOnce({
        id: secretId,
        metadata: {
          id: secretId,
          context: {
            emporer: 'groove',
          },
          environment_id: 'environment_d',
          key_id: 'key1',
          updated_at: '2025-03-11T02:18:54.250931Z',
          version_id: 'version1',
        },
        name: secretName,
        value: 'Pull the lever Gronk',
      });
      const resource = await workos.vault.readSecret({
        name: secretName,
      });
      expect(fetchURL()).toContain(`/vault/v1/kv/${secretName}`);
      expect(fetchMethod()).toBe('GET');
      expect(resource).toMatchObject({
        id: secretId,
        metadata: {
          id: secretId,
          context: {
            emporer: 'groove',
          },
          environmentId: 'environment_d',
          keyId: 'key1',
          updatedAt: new Date(Date.parse('2025-03-11T02:18:54.250931Z')),
          versionId: 'version1',
        },
        name: secretName,
        value: 'Pull the lever Gronk',
      });
    });
  });
});
