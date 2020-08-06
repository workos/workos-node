import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import WorkOS from '../';

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
