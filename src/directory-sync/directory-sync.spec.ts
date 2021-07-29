import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import { WorkOS } from '../workos';

const mock = new MockAdapater(axios);

describe('DirectorySync', () => {
  afterEach(() => mock.resetHistory());

  describe('listDirectories', () => {
    describe('with options', () => {
      it('requests Directories with query parameters', async () => {
        mock.onGet().reply(200, {});
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.directorySync.listDirectories({
          domain: 'google.com',
        });

        expect(mock.history.get[0].params).toEqual({
          domain: 'google.com',
        });
        expect(mock.history.get[0].url).toEqual('/directories');
      });
    });
  });

  describe('deleteDirectory', () => {
    it('sends a request to delete the directory', async () => {
      mock.onDelete().reply(202, {});
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      await workos.directorySync.deleteDirectory('directory_123');

      expect(mock.history.delete[0].url).toEqual('/directories/directory_123');
    });
  });

  describe('listGroups', () => {
    describe('with a Directory', () => {
      it(`requests a Directory's Groups`, async () => {
        mock.onGet().reply(200, {});
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.directorySync.listGroups({
          directory: 'directory_123',
        });

        expect(mock.history.get[0].params).toEqual({
          directory: 'directory_123',
        });
        expect(mock.history.get[0].url).toEqual('/directory_groups');
      });
    });

    describe('with a User', () => {
      it(`requests a Directory's Groups`, async () => {
        mock.onGet().reply(200, {});
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.directorySync.listGroups({
          user: 'directory_usr_123',
        });

        expect(mock.history.get[0].params).toEqual({
          user: 'directory_usr_123',
        });
        expect(mock.history.get[0].url).toEqual('/directory_groups');
      });
    });
  });

  describe('listUsers', () => {
    describe('with a Directory', () => {
      it(`requests a Directory's Users`, async () => {
        mock.onGet().reply(200, {});
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.directorySync.listUsers({
          directory: 'directory_123',
        });

        expect(mock.history.get[0].params).toEqual({
          directory: 'directory_123',
        });
        expect(mock.history.get[0].url).toEqual('/directory_users');
      });

      describe('with custom attributes', () => {
        it('returns the custom attributes, using the provided type', async () => {
          interface MyCustomAttributes {
            managerId: string;
          }

          mock.onGet().reply(200, {
            data: [
              {
                object: 'directory_user',
                id: 'directory_user_01FBSYNGBVB4Q0GE4PJR328QB6',
                directory_id: 'directory_01FBSYNGBN6R6WRMQM47PRCVMH',
                idp_id: 'd899102f-86ad-4c14-9629-cd478b6a1971',
                username: 'Virginia.Stoltenberg92',
                emails: [],
                first_name: 'Virginia',
                last_name: 'Stoltenberg',
                state: 'active',
                raw_attributes: {},
                custom_attributes: {
                  managerId: '99f1817b-149c-4438-b80f-a272c3406109',
                },
                groups: [
                  {
                    object: 'directory_group',
                    id: 'directory_group_01FBSYNGC0ASXP1WPA32AF8430',
                    directory_id: 'directory_01FBSYNGBN6R6WRMQM47PRCVMH',
                    name: 'Strosin, Luettgen and Halvorson',
                    raw_attributes: {},
                  },
                ],
              },
              {
                object: 'directory_user',
                id: 'directory_user_01FBSYQPYWG0SMTGRFFDS5FRQ9',
                directory_id: 'directory_01FBSYQPYN2XMDN7BQHP490M03',
                idp_id: '044d1610-7b9f-47bf-8269-9a5774a7a0d7',
                username: 'Eli.Leffler',
                emails: [],
                first_name: 'Eli',
                last_name: 'Leffler',
                state: 'active',
                raw_attributes: {},
                custom_attributes: {
                  managerId: '263c7472-4d3f-4ab4-8162-e768af103065',
                },
                groups: [
                  {
                    object: 'directory_group',
                    id: 'directory_group_01FBSYQPZ101G15H9VJ5AM35Y3',
                    directory_id: 'directory_01FBSYQPYN2XMDN7BQHP490M03',
                    name: 'Osinski, Bauch and Rice',
                    raw_attributes: {},
                  },
                ],
              },
            ],
          });
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const users =
            await workos.directorySync.listUsers<MyCustomAttributes>({
              directory: 'directory_123',
            });

          const managerIds = users.data.map(
            (user) => user.custom_attributes.managerId,
          );

          expect(managerIds).toEqual([
            '99f1817b-149c-4438-b80f-a272c3406109',
            '263c7472-4d3f-4ab4-8162-e768af103065',
          ]);
        });
      });
    });

    describe('with a Group', () => {
      it(`requests a Directory's Users`, async () => {
        mock.onGet().reply(200, {});
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.directorySync.listUsers({
          group: 'directory_grp_123',
        });

        expect(mock.history.get[0].params).toEqual({
          group: 'directory_grp_123',
        });
        expect(mock.history.get[0].url).toEqual('/directory_users');
      });
    });
  });

  describe('getUser', () => {
    it(`requests a Directory User`, async () => {
      mock.onGet().reply(200, {});
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      await workos.directorySync.getUser('dir_usr_123');

      expect(mock.history.get[0].url).toEqual('/directory_users/dir_usr_123');
    });
  });

  describe('getGroup', () => {
    it(`requests a Directory Group`, async () => {
      mock.onGet().reply(200, {});
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      await workos.directorySync.getGroup('dir_grp_123');

      expect(mock.history.get[0].url).toEqual('/directory_groups/dir_grp_123');
    });
  });
});
