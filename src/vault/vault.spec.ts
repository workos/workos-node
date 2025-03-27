import fetch from 'jest-fetch-mock';
import { fetchMethod, fetchOnce, fetchURL } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import { List } from '../common/interfaces';
import {
  ObjectDigest,
  ObjectMetadata,
  ObjectVersion,
  VaultObject,
} from './interfaces';
import { ConflictException } from '../common/exceptions/conflict.exception';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Vault', () => {
  beforeEach(() => fetch.resetMocks());

  describe('createObject', () => {
    it('creates object', async () => {
      const objectName = 'charger';
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
      const resource = await workos.vault.createObject({
        name: objectName,
        context: { type: 'spore' },
        value: 'Full speed ahead',
      });
      expect(fetchURL()).toContain(`/vault/v1/kv`);
      expect(fetchMethod()).toBe('POST');
      expect(resource).toStrictEqual<ObjectMetadata>({
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

    it('throws an error if object exists', async () => {
      const objectName = 'charger';
      fetchOnce(
        {
          error: 'Item already exists',
        },
        { status: 409 },
      );
      await expect(
        workos.vault.createObject({
          name: objectName,
          context: { type: 'spore' },
          value: 'Full speed ahead',
        }),
      ).rejects.toThrow(ConflictException);
      expect(fetchURL()).toContain(`/vault/v1/kv`);
      expect(fetchMethod()).toBe('POST');
    });
  });

  describe('readObject', () => {
    it('reads a object by id', async () => {
      const objectName = 'lima';
      const objectId = 'object1';
      fetchOnce({
        id: objectId,
        metadata: {
          id: objectId,
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
        name: objectName,
        value: 'Pull the lever Gronk',
      });
      const resource = await workos.vault.readObject({
        id: objectId,
      });
      expect(fetchURL()).toContain(`/vault/v1/kv/${objectId}`);
      expect(fetchMethod()).toBe('GET');
      expect(resource).toStrictEqual<VaultObject>({
        id: objectId,
        metadata: {
          id: objectId,
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
        name: objectName,
        value: 'Pull the lever Gronk',
      });
    });
  });

  describe('readObjectByName', () => {
    it('reads an object by name', async () => {
      const objectName = 'lima';
      const objectId = 'secret1';
      fetchOnce({
        id: objectId,
        metadata: {
          id: objectId,
          context: { emporer: 'groove' },
          environment_id: 'environment_d',
          key_id: 'key1',
          updated_at: '2025-03-11T02:18:54.250931Z',
          updated_by: { id: 'key_xxx', name: 'Local Test Key' },
          version_id: 'version1',
        },
        name: objectName,
        value: 'Pull the lever Gronk',
      });
      const resource = await workos.vault.readObjectByName(objectName);
      expect(fetchURL()).toContain(`/vault/v1/kv/name/${objectName}`);
      expect(fetchMethod()).toBe('GET');
      expect(resource.name).toBe(objectName);
      expect(resource.id).toBe(objectId);
    });
  });

  describe('listObjects', () => {
    it('gets a paginated list of objects', async () => {
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
      const resource = await workos.vault.listObjects();
      expect(fetchURL()).toContain(`/vault/v1/kv`);
      expect(fetchMethod()).toBe('GET');
      expect(resource).toStrictEqual<List<ObjectDigest>>({
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

  describe('listObjectVersions', () => {
    it('gets a paginated list of object versions', async () => {
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
      const resource = await workos.vault.listObjectVersions({ id: 'object1' });
      expect(fetchURL()).toContain(`/vault/v1/kv/object1/versions`);
      expect(fetchMethod()).toBe('GET');
      expect(resource).toStrictEqual<ObjectVersion[]>([
        {
          createdAt: new Date(Date.parse('2029-03-17T15:51:57.000000Z')),
          currentVersion: true,
          id: 'raZUqoHteQkLihH6AG5bj6sYAqMcJS76',
        },
      ]);
    });
  });

  describe('updateObject', () => {
    it('updates object', async () => {
      const objectId = 's1';
      fetchOnce({
        id: objectId,
        name: 'charger',
        metadata: {
          id: objectId,
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
      const resource = await workos.vault.updateObject({
        id: objectId,
        value: 'Full speed ahead',
      });
      expect(fetchURL()).toContain(`/vault/v1/kv/${objectId}`);
      expect(fetchMethod()).toBe('PUT');
      expect(resource).toStrictEqual<VaultObject>({
        id: objectId,
        name: 'charger',
        metadata: {
          id: objectId,
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

    it('throws an error if object version check fails', async () => {
      fetchOnce(
        {
          error: 'Item already exists',
        },
        { status: 409 },
      );
      await expect(
        workos.vault.updateObject({
          id: 'object1',
          value: 'Full speed ahead',
          versionCheck: 'notaversion',
        }),
      ).rejects.toThrow(ConflictException);
      expect(fetchURL()).toContain(`/vault/v1/kv/object1`);
      expect(fetchMethod()).toBe('PUT');
    });
  });

  describe('encrypt and decrypt', () => {
    it('correctly encrypts and decrypts data', async () => {
      // Generate a valid 32-byte (256-bit) key for AES-256-GCM
      const validKey = Buffer.alloc(32).fill('A').toString('base64');

      // Mock createDataKey to return a valid key for testing
      fetchOnce({
        data_key: validKey, // Valid 32-byte key for AES-256-GCM
        encrypted_keys: 'ZW5jcnlwdGVkX2tleXM=', // Base64 encoded "encrypted_keys"
        id: 'key123',
        context: { type: 'test' },
      });

      // Mock decryptDataKey to return same key
      fetchOnce({
        data_key: validKey,
        id: 'key123',
      });

      const originalText = 'This is a secret message';
      const context = { type: 'test' };
      const associatedData = 'additional-auth-data';

      // Encrypt the data
      const encrypted = await workos.vault.encrypt(
        originalText,
        context,
        associatedData,
      );

      // Verify encrypt API call
      expect(fetchURL()).toContain('/vault/v1/keys/data-key');
      expect(fetchMethod()).toBe('POST');

      // Reset fetch for the decrypt call
      fetch.resetMocks();
      fetchOnce({
        data_key: validKey,
        id: 'key123',
      });

      // Decrypt the data
      const decrypted = await workos.vault.decrypt(encrypted, associatedData);

      // Verify decrypt API call
      expect(fetchURL()).toContain('/vault/v1/keys/decrypt');
      expect(fetchMethod()).toBe('POST');

      // Verify the decrypted text matches the original
      expect(decrypted).toBe(originalText);
    });
  });
});
