import { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import { WorkOS } from '../workos';
import { randomUUID } from 'crypto';
import { NotFoundException } from '../index.worker';
import { ConflictException } from '../common/exceptions/conflict.exception';

describe.skip('Vault Live Test', () => {
  let workos: WorkOS;
  const secretPrefix: string = randomUUID();

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
      const allSecrets = await workos.vault.listSecrets({ after: before });

      for (const secret of allSecrets.data) {
        if (secret.name.startsWith(secretPrefix)) {
          await workos.vault.deleteSecret({ id: secret.id });
        }
      }
      before = allSecrets.listMetadata.before;
      listLimit++;
    } while (listLimit < 100 && before !== undefined);
  });

  describe('CRUD secrets', () => {
    it('Creates secrets', async () => {
      const secretName = `${secretPrefix}-lima`;
      const newSecret = await workos.vault.createSecret({
        name: secretName,
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

      expect(newSecret).toStrictEqual(expectedMetadata);

      const secretValue = await workos.vault.readSecret({ id: newSecret.id });
      expect(secretValue).toStrictEqual({
        id: newSecret.id,
        name: secretName,
        value: 'Huacaya 27.7 micron',
        metadata: expectedMetadata,
      });
    });

    it('Fails to create secrets with the same name', async () => {
      const secretName = `${secretPrefix}-lima`;
      await workos.vault.createSecret({
        name: secretName,
        value: 'Huacaya 27.7 micron',
        context: { fiber: 'Alpalca' },
      });

      await expect(
        workos.vault.createSecret({
          name: secretName,
          value: 'Huacaya 27.7 micron',
          context: { fiber: 'Alpalca' },
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('Updates secrets', async () => {
      const secretName = `${secretPrefix}-cusco`;
      const newSecret = await workos.vault.createSecret({
        name: secretName,
        value: 'Tapada 20-30 micron',
        context: { fiber: 'Alpalca' },
      });

      const updatedSecret = await workos.vault.updateSecret({
        id: newSecret.id,
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

      expect(updatedSecret).toStrictEqual({
        id: newSecret.id,
        name: secretName,
        value: undefined,
        metadata: expectedMetadata,
      });

      const secretValue = await workos.vault.readSecret({ id: newSecret.id });
      expect(secretValue).toStrictEqual({
        id: newSecret.id,
        name: secretName,
        value: 'Ccara 30-40 micron',
        metadata: expectedMetadata,
      });
    });

    it('Fails to update secrets with wrong version check', async () => {
      const secretName = `${secretPrefix}-cusco`;
      const newSecret = await workos.vault.createSecret({
        name: secretName,
        value: 'Tapada 20-30 micron',
        context: { fiber: 'Alpalca' },
      });

      await workos.vault.updateSecret({
        id: newSecret.id,
        value: 'Ccara 30-40 micron',
      });

      await expect(
        workos.vault.updateSecret({
          id: newSecret.id,
          value: 'Ccara 30-40 micron',
          versionCheck: newSecret.versionId,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('Deletes secrets', async () => {
      const secretName = `${secretPrefix}-machu`;
      const newSecret = await workos.vault.createSecret({
        name: secretName,
        value: 'Tapada 20-30 micron',
        context: { fiber: 'Alpalca' },
      });

      await workos.vault.deleteSecret({ id: newSecret.id });

      await expect(
        workos.vault.readSecret({ id: newSecret.id }),
      ).rejects.toThrow(NotFoundException);
    });

    it('Describes secrets', async () => {
      const secretName = `${randomUUID()}-trujillo`;
      const newSecret = await workos.vault.createSecret({
        name: secretName,
        value: 'Qiviut 11-13 micron',
        context: { fiber: 'Musk Ox' },
      });

      const secretDescription = await workos.vault.describeSecret({
        id: newSecret.id,
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

      expect(secretDescription).toStrictEqual({
        id: newSecret.id,
        name: secretName,
        metadata: expectedMetadata,
        value: undefined,
      });
    });

    it('Lists secrets with pagination', async () => {
      const secretNames = [];
      const numSecrets = 6;
      const listPrefix = `${secretPrefix}-${randomUUID()}`;

      for (let i = 0; i < numSecrets; i++) {
        const secretName = `${listPrefix}-${i}`;
        await workos.vault.createSecret({
          name: secretName,
          value: 'Qiviut 11-13 micron',
          context: { fiber: 'Musk Ox' },
        });
        secretNames.push(secretName);
      }

      const allSecretNames: string[] = [];
      let before: string | undefined;

      do {
        const list = await workos.vault.listSecrets({
          limit: 2,
          after: before,
        });

        for (const secret of list.data) {
          if (secret.name.startsWith(listPrefix)) {
            allSecretNames.push(secret.name);
          }
        }
        before = list.listMetadata.before;
      } while (before !== undefined);

      const missingSecrets = secretNames.filter(
        (name) => !allSecretNames.includes(name),
      );

      expect(allSecretNames.length).toEqual(numSecrets);
      expect(missingSecrets).toStrictEqual([]);
    });

    it('Lists secret versions', async () => {
      const secretName = `${secretPrefix}-arequipa`;
      const newSecret = await workos.vault.createSecret({
        name: secretName,
        value: 'Tapada 20-30 micron',
        context: { fiber: 'Alpalca' },
      });

      const updatedSecret = await workos.vault.updateSecret({
        id: newSecret.id,
        value: 'Ccara 30-40 micron',
      });

      const versions = await workos.vault.listSecretVersions({
        id: newSecret.id,
      });

      expect(versions.length).toBe(2);

      const currentVersion = versions.find((v) => v.currentVersion);
      expect(currentVersion?.id).toBe(updatedSecret.metadata.versionId);

      const firstVersion = versions.find((v) => v.id === newSecret.versionId);
      expect(firstVersion?.currentVersion).toBe(false);
    });
  });

  describe('encrypt and decrypt', () => {
    it('encrypts and decrypts data', async () => {
      const superSecret = 'hot water freezes faster than cold water';
      const keyContext = {
        everything: 'everywhere',
      };
      const encrypted = await workos.vault.encrypt(superSecret, keyContext);
      const decrypted = await workos.vault.decrypt(encrypted);
      expect(decrypted).toBe(superSecret);
    });
  });
});
