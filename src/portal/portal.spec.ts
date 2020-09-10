import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import { WorkOS } from '../workos';
import listOrganizationsFixture from './fixtures/list-organizations.json';

const mock = new MockAdapater(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Portal', () => {
  afterEach(() => mock.resetHistory());

  describe('listOrganizations', () => {
    describe('without any options', () => {
      it('returns organizations and metadata', async () => {
        mock.onGet().reply(200, listOrganizationsFixture);

        const { data, listMetadata } = await workos.portal.listOrganizations();

        expect(mock.history.get[0].params).toBeUndefined();
        expect(mock.history.get[0].url).toEqual('/organizations');

        expect(data).toHaveLength(7);

        expect(listMetadata).toEqual({
          after: null,
          before: 'before-id',
        });
      });
    });

    describe('with the domain option', () => {
      it('forms the proper request to the API', async () => {
        mock.onGet().reply(200, listOrganizationsFixture);

        const { data } = await workos.portal.listOrganizations({
          domain: 'example.com',
        });

        expect(mock.history.get[0].params).toEqual({
          domain: 'example.com',
        });

        expect(mock.history.get[0].url).toEqual('/organizations');

        expect(data).toHaveLength(7);
      });
    });

    describe('with the before option', () => {
      it('forms the proper request to the API', async () => {
        mock.onGet().reply(200, listOrganizationsFixture);

        const { data } = await workos.portal.listOrganizations({
          before: 'before-id',
        });

        expect(mock.history.get[0].params).toEqual({
          before: 'before-id',
        });

        expect(mock.history.get[0].url).toEqual('/organizations');

        expect(data).toHaveLength(7);
      });
    });

    describe('with the after option', () => {
      it('forms the proper request to the API', async () => {
        mock.onGet().reply(200, listOrganizationsFixture);

        const { data } = await workos.portal.listOrganizations({
          after: 'after-id',
        });

        expect(mock.history.get[0].params).toEqual({
          after: 'after-id',
        });

        expect(mock.history.get[0].url).toEqual('/organizations');

        expect(data).toHaveLength(7);
      });
    });

    describe('with the limit option', () => {
      it('forms the proper request to the API', async () => {
        mock.onGet().reply(200, listOrganizationsFixture);

        const { data } = await workos.portal.listOrganizations({
          limit: 10,
        });

        expect(mock.history.get[0].params).toEqual({
          limit: 10,
        });

        expect(mock.history.get[0].url).toEqual('/organizations');

        expect(data).toHaveLength(7);
      });
    });
  });
});
