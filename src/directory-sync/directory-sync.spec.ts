import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';
import { Directory, Group, UserWithGroups } from './interfaces';

const mock = new MockAdapater(axios);

describe('DirectorySync', () => {
  afterEach(() => mock.resetHistory());

  const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

  const directoryResponse: Directory = {
    id: 'directory_123',
    created_at: '2020-05-06 04:21:48.649164',
    domain: 'foo-corp.com',
    environment_id: 'environment_01EPZWK497BAJ96SW5Q99RWH3C',
    external_key: '9asBRBVHz2ASEkgg',
    name: 'Foo',
    object: 'directory',
    organization_id: 'org_01EXSR7M9QTKCC5D531SMCWMYG',
    state: 'linked',
    type: 'okta scim v1.1',
    updated_at: '2021-10-27 15:21:50.640958',
  };

  const groupResponse: Group = {
    id: 'dir_grp_123',
    directory_id: 'dir_123',
    name: 'Foo Group',
    raw_attributes: {
      foo: 'bar',
    },
  };

  const userWithGroupResponse: UserWithGroups = {
    id: 'user_123',
    custom_attributes: {
      custom: true,
    },
    directory_id: 'dir_123',
    emails: [
      {
        primary: true,
        type: 'type',
        value: 'jonsnow@workos.com',
      },
    ],
    first_name: 'Jon',
    groups: [groupResponse],
    idp_id: 'idp_foo',
    last_name: 'Snow',
    raw_attributes: {},
    state: 'active',
    username: 'jonsnow',
  };

  describe('listDirectories', () => {
    describe('with options', () => {
      it('requests Directories with query parameters', async () => {
        const directoryListResponse: List<Directory> = {
          object: 'list',
          data: [directoryResponse],
          list_metadata: {},
        };

        mock
          .onGet('/directories', {
            domain: 'google.com',
          })
          .replyOnce(200, directoryListResponse);

        const directories = await workos.directorySync.listDirectories({
          domain: 'google.com',
        });

        expect(directories).toEqual(directoryListResponse);
      });
    });
  });

  describe('getDirectory', () => {
    it(`requests a Directory`, async () => {
      mock
        .onGet('/directories/directory_123')
        .replyOnce(200, directoryResponse);

      const directory = await workos.directorySync.getDirectory(
        'directory_123',
      );

      expect(directory).toEqual(directoryResponse);
    });
  });

  describe('deleteDirectory', () => {
    it('sends a request to delete the directory', async () => {
      mock.onDelete('/directories/directory_123').replyOnce(202, {});

      await workos.directorySync.deleteDirectory('directory_123');

      expect(mock.history.delete[0].url).toEqual('/directories/directory_123');
    });
  });

  describe('getGroup', () => {
    it(`requests a Directory Group`, async () => {
      mock.onGet('/directory_groups/dir_grp_123').replyOnce(200, groupResponse);

      const group = await workos.directorySync.getGroup('dir_grp_123');

      expect(group).toEqual(groupResponse);
    });
  });

  describe('listGroups', () => {
    const groupListResponse: List<Group> = {
      object: 'list',
      data: [groupResponse],
      list_metadata: {},
    };

    describe('with a Directory', () => {
      it(`requests a Directory's Groups`, async () => {
        mock
          .onGet('/directory_groups', {
            directory: 'directory_123',
          })
          .replyOnce(200, groupListResponse);

        const list = await workos.directorySync.listGroups({
          directory: 'directory_123',
        });

        expect(list).toEqual(groupListResponse);
      });
    });

    describe('with a User', () => {
      it(`requests a Directory's Groups`, async () => {
        mock
          .onGet('/directory_groups', {
            user: 'directory_usr_123',
          })
          .replyOnce(200, groupListResponse);

        const list = await workos.directorySync.listGroups({
          user: 'directory_usr_123',
        });

        expect(list).toEqual(groupListResponse);
      });
    });
  });

  describe('listUsers', () => {
    const userWithGroupListResponse: List<UserWithGroups> = {
      object: 'list',
      data: [userWithGroupResponse],
      list_metadata: {},
    };

    describe('with a Directory', () => {
      it(`requests a Directory's Users`, async () => {
        mock
          .onGet('/directory_users', {
            directory: 'directory_123',
          })
          .replyOnce(200, userWithGroupListResponse);

        const list = await workos.directorySync.listUsers({
          directory: 'directory_123',
        });

        expect(list).toEqual(userWithGroupListResponse);
      });

      describe('with custom attributes', () => {
        it('returns the custom attributes, using the provided type', async () => {
          interface MyCustomAttributes {
            managerId: string;
          }

          mock
            .onGet('/directory_users', {
              directory: 'directory_123',
            })
            .replyOnce(200, {
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
        mock
          .onGet('/directory_users', {
            group: 'directory_grp_123',
          })
          .replyOnce(200, userWithGroupListResponse);

        const list = await workos.directorySync.listUsers({
          group: 'directory_grp_123',
        });

        expect(list).toEqual(userWithGroupListResponse);
      });
    });
  });

  describe('getUser', () => {
    it(`requests a Directory User`, async () => {
      mock
        .onGet('/directory_users/dir_usr_123')
        .replyOnce(200, userWithGroupResponse);

      const user = await workos.directorySync.getUser('dir_usr_123');

      expect(user).toEqual(userWithGroupResponse);
    });
  });
});
