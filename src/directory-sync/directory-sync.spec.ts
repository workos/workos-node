import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import WorkOS from '../workos';

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

  describe('listGroups', () => {
    it(`requests a Directory's Groups`, async () => {
      mock.onGet().reply(200, {});
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      await workos.directorySync.listGroups('dir_edp_123');

      expect(mock.history.get[0].url).toEqual(
        '/directories/dir_edp_123/groups',
      );
    });
  });

  describe('listUsers', () => {
    it(`requests a Directory's Users`, async () => {
      mock.onGet().reply(200, {});
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      await workos.directorySync.listUsers('dir_edp_123');

      expect(mock.history.get[0].url).toEqual('/directories/dir_edp_123/users');
    });
  });

  describe('listUsersGroups', () => {
    it(`requests a User's Groups`, async () => {
      mock.onGet().reply(200, {});
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      await workos.directorySync.listUsersGroups('dir_edp_123', 'dir_usr_123');

      expect(mock.history.get[0].url).toEqual(
        '/directories/dir_edp_123/users/dir_usr_123/groups',
      );
    });
  });
});
