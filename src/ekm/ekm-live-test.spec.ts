import { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import { WorkOS } from '../workos';
import { decrypt } from './decrypt';
import { encrypt } from './encrypt';

describe.only('EKM Live Test', () => {
  let workos: WorkOS;
  beforeAll(() => {
    disableFetchMocks();
    workos = new WorkOS(undefined, { ekmHostname: 'ekm.workos-test.com' });
  });

  afterAll(() => {
    enableFetchMocks();
  });

  it('generates data keys based on context', async () => {
    const context = { organization_id: 'org_abc' };
    const result = await workos.ekm.fetchKey({ context });
    expect(result.context).toMatchObject(context);
    expect(result.key).toBeTruthy();

    const { dataKey } = await workos.ekm.decryptKey(result.encryptedKeys);
    expect(dataKey).toEqual(result.key);

    const context2 = { organization_id: 'org_xyz' };
    const result2 = await workos.ekm.fetchKey({ context: context2 });
    expect(result2.key).not.toEqual(result.key);
    expect(result2.encryptedKeys).not.toEqual(result.encryptedKeys);
  });

  it('encrypts and decrypts data using an EKM key', async () => {
    const context = { organization_id: 'org_abc' };
    const { key, encryptedKeys } = await workos.ekm.fetchKey({ context });

    const data = 'hunter2';
    const ciphertext = encrypt(data, key, encryptedKeys);

    const decrypted = decrypt(ciphertext, key);
    expect(decrypted).toEqual(data);
  });
});
