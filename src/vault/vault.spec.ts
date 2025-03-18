import fetch from 'jest-fetch-mock';
import { fetchMethod, fetchOnce, fetchURL } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import { List } from '../common/interfaces';
import {
  SecretDigest,
  SecretMetadata,
  SecretVersion,
  VaultSecret,
} from './interfaces';
import { ConflictException } from '../common/exceptions/conflict.exception';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Vault', () => {
  beforeEach(() => fetch.resetMocks());

  describe('createSecret', () => {
    it('creates secret', async () => {
      const secretName = 'charger';
      fetchOnce({
        id: 's1',
        context: {
          type: 'spore',
        },
        environment_id: 'xxx',
        key_id: 'k1',
        updated_at: '2029-03-17T04:37:46.748303Z',
        updated_by: {
          id: 'key_xxx',
          name: 'Local Test Key',
        },
        version_id: 'v1',
      });
      const resource = await workos.vault.createSecret({
        name: secretName,
        context: { type: 'spore' },
        value: 'Full speed ahead',
      });
      expect(fetchURL()).toContain(`/vault/v1/kv`);
      expect(fetchMethod()).toBe('POST');
      expect(resource).toStrictEqual<SecretMetadata>({
        id: 's1',
        context: {
          type: 'spore',
        },
        environmentId: 'xxx',
        keyId: 'k1',
        updatedAt: new Date(Date.parse('2029-03-17T04:37:46.748303Z')),
        updatedBy: {
          id: 'key_xxx',
          name: 'Local Test Key',
        },
        versionId: 'v1',
      });
    });

    it('throws an error if secret exists', async () => {
      const secretName = 'charger';
      fetchOnce(
        {
          error: 'Item already exists',
        },
        { status: 409 },
      );
      await expect(
        workos.vault.createSecret({
          name: secretName,
          context: { type: 'spore' },
          value: 'Full speed ahead',
        }),
      ).rejects.toThrow(ConflictException);
      expect(fetchURL()).toContain(`/vault/v1/kv`);
      expect(fetchMethod()).toBe('POST');
    });
  });

  describe('readSecret', () => {
    it('reads a secret by id', async () => {
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
          updated_by: {
            id: 'key_xxx',
            name: 'Local Test Key',
          },
          version_id: 'version1',
        },
        name: secretName,
        value: 'Pull the lever Gronk',
      });
      const resource = await workos.vault.readSecret({
        id: secretId,
      });
      expect(fetchURL()).toContain(`/vault/v1/kv/${secretId}`);
      expect(fetchMethod()).toBe('GET');
      expect(resource).toStrictEqual<VaultSecret>({
        id: secretId,
        metadata: {
          id: secretId,
          context: {
            emporer: 'groove',
          },
          environmentId: 'environment_d',
          keyId: 'key1',
          updatedAt: new Date(Date.parse('2025-03-11T02:18:54.250931Z')),
          updatedBy: {
            id: 'key_xxx',
            name: 'Local Test Key',
          },
          versionId: 'version1',
        },
        name: secretName,
        value: 'Pull the lever Gronk',
      });
    });
  });

  describe('listSecrets', () => {
    it('gets a paginated list of secrets', async () => {
      fetchOnce({
        data: [
          {
            id: 's1',
            name: 'charger',
            updated_at: '2029-03-17T04:37:46.748303Z',
          },
        ],
        list_metadata: {
          after: null,
          before: 'charger',
        },
      });
      const resource = await workos.vault.listSecrets();
      expect(fetchURL()).toContain(`/vault/v1/kv`);
      expect(fetchMethod()).toBe('GET');
      expect(resource).toStrictEqual<List<SecretDigest>>({
        object: 'list',
        data: [
          {
            id: 's1',
            name: 'charger',
            updatedAt: new Date(Date.parse('2029-03-17T04:37:46.748303Z')),
          },
        ],
        listMetadata: {
          after: undefined,
          before: 'charger',
        },
      });
    });
  });

  describe('listSecretVersions', () => {
    it('gets a paginated list of secret versions', async () => {
      fetchOnce({
        data: [
          {
            id: 'raZUqoHteQkLihH6AG5bj6sYAqMcJS76',
            size: 270,
            etag: '"5147c963627323edcb15910ceea573bf"',
            created_at: '2029-03-17T15:51:57.000000Z',
            current_version: true,
          },
        ],
        list_metadata: {
          after: null,
          before: 'raZUqoHteQkLihH6AG5bj6sYAqMcJS76',
        },
      });
      const resource = await workos.vault.listSecretVersions({ id: 'secret1' });
      expect(fetchURL()).toContain(`/vault/v1/kv/secret1/versions`);
      expect(fetchMethod()).toBe('GET');
      expect(resource).toStrictEqual<SecretVersion[]>([
        {
          createdAt: new Date(Date.parse('2029-03-17T15:51:57.000000Z')),
          currentVersion: true,
          id: 'raZUqoHteQkLihH6AG5bj6sYAqMcJS76',
        },
      ]);
    });
  });

  describe('updateSecret', () => {
    it('updates secret', async () => {
      const secretId = 's1';
      fetchOnce({
        id: secretId,
        name: 'charger',
        metadata: {
          id: secretId,
          context: {
            type: 'spore',
          },
          environment_id: 'xxx',
          key_id: 'k1',
          updated_at: '2029-03-17T04:37:46.748303Z',
          updated_by: {
            id: 'key_xxx',
            name: 'Local Test Key',
          },
          version_id: 'v1',
        },
      });
      const resource = await workos.vault.updateSecret({
        id: secretId,
        value: 'Full speed ahead',
      });
      expect(fetchURL()).toContain(`/vault/v1/kv/${secretId}`);
      expect(fetchMethod()).toBe('PUT');
      expect(resource).toStrictEqual<VaultSecret>({
        id: secretId,
        name: 'charger',
        metadata: {
          id: secretId,
          context: {
            type: 'spore',
          },
          environmentId: 'xxx',
          keyId: 'k1',
          updatedAt: new Date(Date.parse('2029-03-17T04:37:46.748303Z')),
          updatedBy: {
            id: 'key_xxx',
            name: 'Local Test Key',
          },
          versionId: 'v1',
        },
        value: undefined,
      });
    });

    it('throws an error if secret version check fails', async () => {
      fetchOnce(
        {
          error: 'Item already exists',
        },
        { status: 409 },
      );
      await expect(
        workos.vault.updateSecret({
          id: 'secret1',
          value: 'Full speed ahead',
          versionCheck: 'notaversion',
        }),
      ).rejects.toThrow(ConflictException);
      expect(fetchURL()).toContain(`/vault/v1/kv/secret1`);
      expect(fetchMethod()).toBe('PUT');
    });
  });
});
