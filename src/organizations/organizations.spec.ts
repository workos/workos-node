import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { WorkOS } from '../workos';
import createOrganizationInvalid from './fixtures/create-organization-invalid.json';
import createOrganization from './fixtures/create-organization.json';
import listOrganizationsFixture from './fixtures/list-organizations.json';
import updateOrganization from './fixtures/update-organization.json';

const mock = new MockAdapter(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Organizations', () => {
  afterEach(() => mock.resetHistory());

  describe('listOrganizations', () => {
    describe('without any options', () => {
      it('returns organizations and metadata', async () => {
        mock.onGet().reply(200, listOrganizationsFixture);

        const { data, listMetadata } =
          await workos.organizations.listOrganizations();

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

        const { data } = await workos.organizations.listOrganizations({
          domains: ['example.com'],
        });

        expect(mock.history.get[0].params).toEqual({
          domains: ['example.com'],
        });

        expect(mock.history.get[0].url).toEqual('/organizations');

        expect(data).toHaveLength(7);
      });
    });

    describe('with the before option', () => {
      it('forms the proper request to the API', async () => {
        mock.onGet().reply(200, listOrganizationsFixture);

        const { data } = await workos.organizations.listOrganizations({
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

        const { data } = await workos.organizations.listOrganizations({
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

        const { data } = await workos.organizations.listOrganizations({
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

  describe('createOrganization', () => {
    describe('with a valid payload', () => {
      it('creates an organization', async () => {
        mock.onPost().reply(201, createOrganization);

        const subject = await workos.organizations.createOrganization({
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
          await workos.organizations.createOrganization({
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

  describe('getOrganization', () => {
    it(`requests an Organization`, async () => {
      const mock = new MockAdapter(axios);
      mock.onGet().reply(200, {});
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
      await workos.organizations.getOrganization(
        'org_01EHT88Z8J8795GZNQ4ZP1J81T',
      );

      expect(mock.history.get[0].url).toEqual(
        '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T',
      );
    });
  });

  describe('updateOrganization', () => {
    describe('with a valid payload', () => {
      it('updates an organization', async () => {
        mock.onPut().reply(201, updateOrganization);

        const subject = await workos.organizations.updateOrganization({
          organization: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
          domains: ['example.com'],
          name: 'Test Organization 2',
        });

        expect(subject.id).toEqual('org_01EHT88Z8J8795GZNQ4ZP1J81T');
        expect(subject.name).toEqual('Test Organization 2');
        expect(subject.domains).toHaveLength(1);
      });
    });
  });
});
