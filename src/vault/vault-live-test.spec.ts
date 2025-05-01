import { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import { WorkOS } from '../workos';
import { randomUUID } from 'crypto';
import { NotFoundException } from '../index.worker';
import { ConflictException } from '../common/exceptions/conflict.exception';

describe.skip('Vault Live Test', () => {
  let workos: WorkOS;
  const objectPrefix: string = randomUUID();

  beforeAll(() => {
    disableFetchMocks();
    workos = new WorkOS('API_KEY');
  });

  afterAll(() => {
    enableFetchMocks();
  });

  afterEach(async () => {
    let listLimit = 0;
    let before: string | undefined;

    do {
      const allObjects = await workos.vault.listObjects({ after: before });

      for (const object of allObjects.data) {
        if (object.name.startsWith(objectPrefix)) {
          await workos.vault.deleteObject({ id: object.id });
        }
      }
      before = allObjects.listMetadata.before;
      listLimit++;
    } while (listLimit < 100 && before !== undefined);
  });

  describe('CRUD objects', () => {
    it('Creates objects', async () => {
      const objectName = `${objectPrefix}-lima`;
      const newObject = await workos.vault.createObject({
        name: objectName,
        value: 'Huacaya 27.7 micron',
        context: { fiber: 'Alpalca' },
      });

      const expectedMetadata = {
        id: expect.any(String),
        context: {
          fiber: 'Alpalca',
        },
        environmentId: expect.any(String),
        keyId: expect.any(String),
        updatedAt: expect.any(Date),
        updatedBy: {
          id: expect.any(String),
          name: expect.any(String),
        },
        versionId: expect.any(String),
      };

      expect(newObject).toStrictEqual(expectedMetadata);

      const objectValue = await workos.vault.readObject({ id: newObject.id });
      expect(objectValue).toStrictEqual({
        id: newObject.id,
        name: objectName,
        value: 'Huacaya 27.7 micron',
        metadata: expectedMetadata,
      });
    });

    it('Fails to create objects with the same name', async () => {
      const objectName = `${objectPrefix}-lima`;
      await workos.vault.createObject({
        name: objectName,
        value: 'Huacaya 27.7 micron',
        context: { fiber: 'Alpalca' },
      });

      await expect(
        workos.vault.createObject({
          name: objectName,
          value: 'Huacaya 27.7 micron',
          context: { fiber: 'Alpalca' },
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('Updates objects', async () => {
      const objectName = `${objectPrefix}-cusco`;
      const newObject = await workos.vault.createObject({
        name: objectName,
        value: 'Tapada 20-30 micron',
        context: { fiber: 'Alpalca' },
      });

      const updatedObject = await workos.vault.updateObject({
        id: newObject.id,
        value: 'Ccara 30-40 micron',
      });

      const expectedMetadata = {
        id: expect.any(String),
        context: {
          fiber: 'Alpalca',
        },
        environmentId: expect.any(String),
        keyId: expect.any(String),
        updatedAt: expect.any(Date),
        updatedBy: {
          id: expect.any(String),
          name: expect.any(String),
        },
        versionId: expect.any(String),
      };

      expect(updatedObject).toStrictEqual({
        id: newObject.id,
        name: objectName,
        value: undefined,
        metadata: expectedMetadata,
      });

      const objectValue = await workos.vault.readObject({ id: newObject.id });
      expect(objectValue).toStrictEqual({
        id: newObject.id,
        name: objectName,
        value: 'Ccara 30-40 micron',
        metadata: expectedMetadata,
      });
    });

    it('Fails to update objects with wrong version check', async () => {
      const objectName = `${objectPrefix}-cusco`;
      const newObject = await workos.vault.createObject({
        name: objectName,
        value: 'Tapada 20-30 micron',
        context: { fiber: 'Alpalca' },
      });

      await workos.vault.updateObject({
        id: newObject.id,
        value: 'Ccara 30-40 micron',
      });

      await expect(
        workos.vault.updateObject({
          id: newObject.id,
          value: 'Ccara 30-40 micron',
          versionCheck: newObject.versionId,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('Deletes objects', async () => {
      const objectName = `${objectPrefix}-machu`;
      const newObject = await workos.vault.createObject({
        name: objectName,
        value: 'Tapada 20-30 micron',
        context: { fiber: 'Alpalca' },
      });

      await workos.vault.deleteObject({ id: newObject.id });

      await expect(
        workos.vault.readObject({ id: newObject.id }),
      ).rejects.toThrow(NotFoundException);
    });

    it('Describes objects', async () => {
      const objectName = `${randomUUID()}-trujillo`;
      const newObject = await workos.vault.createObject({
        name: objectName,
        value: 'Qiviut 11-13 micron',
        context: { fiber: 'Musk Ox' },
      });

      const objectDescription = await workos.vault.describeObject({
        id: newObject.id,
      });

      const expectedMetadata = {
        id: expect.any(String),
        context: {
          fiber: 'Musk Ox',
        },
        environmentId: expect.any(String),
        keyId: expect.any(String),
        updatedAt: expect.any(Date),
        updatedBy: {
          id: expect.any(String),
          name: expect.any(String),
        },
        versionId: expect.any(String),
      };

      expect(objectDescription).toStrictEqual({
        id: newObject.id,
        name: objectName,
        metadata: expectedMetadata,
        value: undefined,
      });
    });

    it('Lists objects with pagination', async () => {
      const objectNames = [];
      const numObjects = 6;
      const listPrefix = `${objectPrefix}-${randomUUID()}`;

      for (let i = 0; i < numObjects; i++) {
        const objectName = `${listPrefix}-${i}`;
        await workos.vault.createObject({
          name: objectName,
          value: 'Qiviut 11-13 micron',
          context: { fiber: 'Musk Ox' },
        });
        objectNames.push(objectName);
      }

      const allObjectNames: string[] = [];
      let before: string | undefined;

      do {
        const list = await workos.vault.listObjects({
          limit: 2,
          after: before,
        });

        for (const object of list.data) {
          if (object.name.startsWith(listPrefix)) {
            allObjectNames.push(object.name);
          }
        }
        before = list.listMetadata.before;
      } while (before !== undefined);

      const missingObjects = objectNames.filter(
        (name) => !allObjectNames.includes(name),
      );

      expect(allObjectNames.length).toEqual(numObjects);
      expect(missingObjects).toStrictEqual([]);
    });

    it('Lists object versions', async () => {
      const objectName = `${objectPrefix}-arequipa`;
      const newObject = await workos.vault.createObject({
        name: objectName,
        value: 'Tapada 20-30 micron',
        context: { fiber: 'Alpalca' },
      });

      const updatedObject = await workos.vault.updateObject({
        id: newObject.id,
        value: 'Ccara 30-40 micron',
      });

      const versions = await workos.vault.listObjectVersions({
        id: newObject.id,
      });

      expect(versions.length).toBe(2);

      const currentVersion = versions.find((v) => v.currentVersion);
      expect(currentVersion?.id).toBe(updatedObject.metadata.versionId);

      const firstVersion = versions.find((v) => v.id === newObject.versionId);
      expect(firstVersion?.currentVersion).toBe(false);
    });
  });

  describe('encrypt and decrypt', () => {
    it('encrypts and decrypts data', async () => {
      const superObject = 'hot water freezes faster than cold water';
      const keyContext = {
        everything: 'everywhere',
      };
      const encrypted = await workos.vault.encrypt(superObject, keyContext);
      const decrypted = await workos.vault.decrypt(encrypted);
      expect(decrypted).toBe(superObject);
    });

    it('authenticates additional data', async () => {
      const data = 'hot water freezes faster than cold water';
      const keyContext = { everything: 'everywhere' };
      const aad = 'seq1';
      const encrypted = await workos.vault.encrypt(data, keyContext, aad);
      const decrypted = await workos.vault.decrypt(encrypted, aad);
      expect(decrypted).toBe(data);
    });

    it('fails with invalid AD', async () => {
      const data = 'hot water freezes faster than cold water';
      const keyContext = { everything: 'everywhere' };
      const aad = 'seq1';
      const encrypted = await workos.vault.encrypt(data, keyContext, aad);
      await expect(() => workos.vault.decrypt(encrypted)).rejects.toThrow(
        'unable to authenticate data',
      );
    });
  });
});
