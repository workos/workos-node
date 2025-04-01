import fetch from 'jest-fetch-mock';
import {
  fetchOnce,
  fetchURL,
  fetchSearchParams,
} from '../common/utils/test-utils';
import { ListResponse } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';
import {
  Directory,
  DirectoryGroup,
  DirectoryGroupResponse,
  DirectoryResponse,
  DirectoryUserWithGroups,
  DirectoryUserWithGroupsResponse,
} from './interfaces';

describe('DirectorySync', () => {
  beforeEach(() => fetch.resetMocks());

  const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

  const directory: Directory = {
    id: 'directory_123',
    createdAt: '2020-05-06 04:21:48.649164',
    domain: 'foo-corp.com',
    externalKey: '9asBRBVHz2ASEkgg',
    name: 'Foo',
    object: 'directory',
    organizationId: 'org_01EXSR7M9QTKCC5D531SMCWMYG',
    state: 'active',
    type: 'okta scim v2.0',
    updatedAt: '2021-12-13 12:15:45.531847',
  };

  const directoryResponse: DirectoryResponse = {
    id: 'directory_123',
    created_at: '2020-05-06 04:21:48.649164',
    domain: 'foo-corp.com',
    external_key: '9asBRBVHz2ASEkgg',
    name: 'Foo',
    object: 'directory',
    organization_id: 'org_01EXSR7M9QTKCC5D531SMCWMYG',
    state: 'linked',
    type: 'okta scim v2.0',
    updated_at: '2021-12-13 12:15:45.531847',
  };

  const group: DirectoryGroup = {
    id: 'dir_grp_123',
    idpId: '123',
    directoryId: 'dir_123',
    organizationId: 'org_123',
    name: 'Foo Group',
    createdAt: '2021-10-27 15:21:50.640958',
    updatedAt: '2021-12-13 12:15:45.531847',
    rawAttributes: {
      foo: 'bar',
    },
  };

  const groupResponse: DirectoryGroupResponse = {
    id: 'dir_grp_123',
    idp_id: '123',
    directory_id: 'dir_123',
    organization_id: 'org_123',
    name: 'Foo Group',
    created_at: '2021-10-27 15:21:50.640958',
    updated_at: '2021-12-13 12:15:45.531847',
    raw_attributes: {
      foo: 'bar',
    },
  };

  const userWithGroup: DirectoryUserWithGroups = {
    object: 'directory_user',
    id: 'user_123',
    customAttributes: {
      custom: true,
    },
    directoryId: 'dir_123',
    organizationId: 'org_123',
    email: 'jonsnow@workos.com',
    emails: [
      {
        primary: true,
        type: 'type',
        value: 'jonsnow@workos.com',
      },
    ],
    firstName: 'Jon',
    groups: [group],
    idpId: 'idp_foo',
    lastName: 'Snow',
    jobTitle: 'Knight of the Watch',
    rawAttributes: {},
    state: 'active',
    username: 'jonsnow',
    createdAt: '2021-10-27 15:21:50.640959',
    updatedAt: '2021-12-13 12:15:45.531847',
  };

  const userWithGroupResponse: DirectoryUserWithGroupsResponse = {
    object: 'directory_user',
    id: 'user_123',
    custom_attributes: {
      custom: true,
    },
    directory_id: 'dir_123',
    organization_id: 'org_123',
    email: 'jonsnow@workos.com',
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
    job_title: 'Knight of the Watch',
    raw_attributes: {},
    state: 'active',
    username: 'jonsnow',
    created_at: '2021-10-27 15:21:50.640959',
    updated_at: '2021-12-13 12:15:45.531847',
  };

  const userWithRole: DirectoryUserWithGroups = {
    object: 'directory_user',
    id: 'directory_user_456',
    customAttributes: {
      custom: true,
    },
    directoryId: 'dir_123',
    organizationId: 'org_123',
    email: 'jonsnow@workos.com',
    emails: [
      {
        primary: true,
        type: 'type',
        value: 'jonsnow@workos.com',
      },
    ],
    firstName: 'Jon',
    groups: [group],
    idpId: 'idp_foo',
    lastName: 'Snow',
    jobTitle: 'Knight of the Watch',
    rawAttributes: {},
    state: 'active',
    username: 'jonsnow',
    role: { slug: 'super_admin' },
    createdAt: '2021-10-27 15:21:50.640959',
    updatedAt: '2021-12-13 12:15:45.531847',
  };

  const userWithRoleResponse: DirectoryUserWithGroupsResponse = {
    object: 'directory_user',
    id: 'directory_user_456',
    custom_attributes: {
      custom: true,
    },
    directory_id: 'dir_123',
    organization_id: 'org_123',
    email: 'jonsnow@workos.com',
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
    job_title: 'Knight of the Watch',
    raw_attributes: {},
    state: 'active',
    username: 'jonsnow',
    role: { slug: 'super_admin' },
    created_at: '2021-10-27 15:21:50.640959',
    updated_at: '2021-12-13 12:15:45.531847',
  };

  describe('listDirectories', () => {
    describe('with options', () => {
      it('requests Directories with query parameters', async () => {
        const directoryListResponse: ListResponse<DirectoryResponse> = {
          object: 'list',
          data: [directoryResponse],
          list_metadata: {},
        };

        fetchOnce(directoryListResponse);

        const subject = await workos.directorySync.listDirectories({
          organizationId: 'org_1234',
        });

        expect(fetchSearchParams()).toMatchObject({
          organization_id: 'org_1234',
        });
        expect(subject).toMatchObject({
          object: 'list',
          list: {
            object: 'list',
            data: [directory],
            listMetadata: {},
          },
          apiCall: expect.any(Function),
        });
      });
    });
  });

  describe('getDirectory', () => {
    it(`requests a Directory`, async () => {
      fetchOnce(directoryResponse);

      const subject = await workos.directorySync.getDirectory('directory_123');

      expect(subject).toEqual(directory);
    });
  });

  describe('deleteDirectory', () => {
    it('sends a request to delete the directory', async () => {
      fetchOnce({}, { status: 202 });

      await workos.directorySync.deleteDirectory('directory_123');

      expect(fetchURL()).toContain('/directories/directory_123');
    });
  });

  describe('getGroup', () => {
    it(`requests a Directory Group`, async () => {
      fetchOnce(groupResponse);

      const subject = await workos.directorySync.getGroup('dir_grp_123');

      expect(subject).toEqual(group);
    });
  });

  describe('listGroups', () => {
    const groupListResponse: ListResponse<DirectoryGroupResponse> = {
      object: 'list',
      data: [groupResponse],
      list_metadata: {},
    };

    describe('with a Directory', () => {
      it(`requests a Directory's Groups`, async () => {
        fetchOnce(groupListResponse);

        const subject = await workos.directorySync.listGroups({
          directory: 'directory_123',
        });

        expect(fetchSearchParams()).toMatchObject({
          directory: 'directory_123',
        });
        expect(subject).toMatchObject({
          object: 'list',
          list: {
            object: 'list',
            data: [group],
            listMetadata: {},
          },
          apiCall: expect.any(Function),
          options: {
            directory: 'directory_123',
          },
        });
      });
    });

    describe('with a User', () => {
      it(`requests a Directory's Groups`, async () => {
        fetchOnce(groupListResponse);

        const subject = await workos.directorySync.listGroups({
          user: 'directory_usr_123',
        });

        expect(fetchSearchParams()).toMatchObject({
          user: 'directory_usr_123',
        });
        expect(subject).toEqual({
          object: 'list',
          list: {
            object: 'list',
            data: [group],
            listMetadata: {},
          },
          apiCall: expect.any(Function),
          options: {
            user: 'directory_usr_123',
          },
        });
      });
    });
  });

  describe('listUsers', () => {
    const userWithGroupListResponse: ListResponse<DirectoryUserWithGroupsResponse> =
      {
        object: 'list',
        data: [userWithGroupResponse],
        list_metadata: {},
      };

    describe('with a Directory', () => {
      it(`requests a Directory's Users`, async () => {
        fetchOnce(userWithGroupListResponse);

        const subject = await workos.directorySync.listUsers({
          directory: 'directory_123',
        });

        expect(fetchSearchParams()).toMatchObject({
          directory: 'directory_123',
        });
        expect(subject).toMatchObject({
          object: 'list',
          list: {
            object: 'list',
            data: [userWithGroup],
            listMetadata: {},
          },
          apiCall: expect.any(Function),
          options: {
            directory: 'directory_123',
          },
        });
      });

      describe('with custom attributes', () => {
        it('returns the custom attributes, using the provided type', async () => {
          interface MyCustomAttributes {
            managerId: string;
          }

          fetchOnce(
            {
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
                  job_title: 'Software Engineer',
                  state: 'active',
                  created_at: '2021-10-27 15:21:50.640959',
                  updated_at: '2021-12-13 12:15:45.531847',
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
                  job_title: 'Software Engineer',
                  state: 'active',
                  created_at: '2021-10-27 15:21:50.640959',
                  updated_at: '2021-12-13 12:15:45.531847',
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
            },
            { status: 200 },
          );

          const users =
            await workos.directorySync.listUsers<MyCustomAttributes>({
              directory: 'directory_123',
            });

          expect(fetchSearchParams()).toMatchObject({
            directory: 'directory_123',
          });

          const managerIds = users.data.map(
            (user) => user.customAttributes.managerId,
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
        fetchOnce(userWithGroupListResponse);

        const subject = await workos.directorySync.listUsers({
          group: 'directory_grp_123',
        });

        expect(fetchSearchParams()).toMatchObject({
          group: 'directory_grp_123',
        });
        expect(subject).toMatchObject({
          object: 'list',
          list: {
            object: 'list',
            data: [userWithGroup],
            listMetadata: {},
          },
          apiCall: expect.any(Function),
          options: {
            group: 'directory_grp_123',
          },
        });
      });
    });
  });

  describe('getUser', () => {
    it(`requests a Directory User`, async () => {
      fetchOnce(userWithGroupResponse);

      const subject = await workos.directorySync.getUser('dir_usr_123');

      expect(subject).toEqual(userWithGroup);
    });

    describe('with a Role', () => {
      it(`requests a Directory User`, async () => {
        fetchOnce(userWithRoleResponse);

        const subject =
          await workos.directorySync.getUser('directory_user_456');

        expect(subject).toEqual(userWithRole);
      });
    });
  });
});
