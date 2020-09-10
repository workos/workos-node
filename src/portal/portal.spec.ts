import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import { WorkOS } from '../workos';

import createOrganization from './fixtures/create-organization.json';
import createOrganizationInvalid from './fixtures/create-organization-invalid.json';
import listOrganizationsFixture from './fixtures/list-organizations.json';

const mock = new MockAdapater(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Portal', () => {
  afterEach(() => mock.resetHistory());

  describe('createOrganization', () => {
    describe('with a valid payload', () => {
      it('creates an organization', async () => {
        mock.onPost().reply(201, createOrganization);

        const subject = await workos.portal.createOrganization({
          domains: ['example.com'],
          name: 'Test Organization',
        });

        expect(subject.id).toEqual('org_01EHT88Z8J8795GZNQ4ZP1J81T');
        expect(subject.name).toEqual('Test Organization');
        expect(subject.domains).toHaveLength(1);
      });
    });

    describe('with an invalid payload', () => {
      it('returns an error', async () => {
        mock.onPost().reply(409, createOrganizationInvalid, {
          'X-Request-ID': 'a-request-id',
        });

        try {
          await workos.portal.createOrganization({
            domains: ['example.com'],
            name: 'Test Organization',
          });
        } catch (error) {
          expect(error.message).toEqual(
            'An Organization with the domain example.com already exists.',
          );
        }
      });
    });
  });

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
