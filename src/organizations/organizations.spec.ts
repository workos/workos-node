import fetch from 'jest-fetch-mock';
import {
  fetchOnce,
  fetchURL,
  fetchSearchParams,
  fetchHeaders,
  fetchBody,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import createOrganizationInvalid from './fixtures/create-organization-invalid.json';
import createOrganization from './fixtures/create-organization.json';
import getOrganization from './fixtures/get-organization.json';
import listOrganizationsFixture from './fixtures/list-organizations.json';
import updateOrganization from './fixtures/update-organization.json';
import { DomainDataState } from './interfaces';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Organizations', () => {
  beforeEach(() => fetch.resetMocks());

  describe('listOrganizations', () => {
    describe('without any options', () => {
      it('returns organizations and metadata', async () => {
        fetchOnce(listOrganizationsFixture);

        const { data, listMetadata } =
          await workos.organizations.listOrganizations();

        expect(fetchSearchParams()).toEqual({
          order: 'desc',
        });
        expect(fetchURL()).toContain('/organizations');

        expect(data).toHaveLength(7);

        expect(listMetadata).toEqual({
          after: null,
          before: 'before-id',
        });
      });
    });

    describe('with the domain option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationsFixture);

        const { data } = await workos.organizations.listOrganizations({
          domains: ['example.com', 'example2.com'],
        });

        expect(fetchSearchParams()).toEqual({
          domains: 'example.com,example2.com',
          order: 'desc',
        });

        expect(fetchURL()).toContain('/organizations');

        expect(data).toHaveLength(7);
      });
    });

    describe('with the before option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationsFixture);

        const { data } = await workos.organizations.listOrganizations({
          before: 'before-id',
        });

        expect(fetchSearchParams()).toEqual({
          before: 'before-id',
          order: 'desc',
        });

        expect(fetchURL()).toContain('/organizations');

        expect(data).toHaveLength(7);
      });
    });

    describe('with the after option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationsFixture);

        const { data } = await workos.organizations.listOrganizations({
          after: 'after-id',
        });

        expect(fetchSearchParams()).toEqual({
          after: 'after-id',
          order: 'desc',
        });

        expect(fetchURL()).toContain('/organizations');

        expect(data).toHaveLength(7);
      });
    });

    describe('with the limit option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationsFixture);

        const { data } = await workos.organizations.listOrganizations({
          limit: 10,
        });

        expect(fetchSearchParams()).toEqual({
          limit: '10',
          order: 'desc',
        });

        expect(fetchURL()).toContain('/organizations');

        expect(data).toHaveLength(7);
      });
    });
  });

  describe('createOrganization', () => {
    describe('with an idempotency key', () => {
      it('includes an idempotency key with request', async () => {
        fetchOnce(createOrganization, { status: 201 });

        await workos.organizations.createOrganization(
          {
            domains: ['example.com'],
            name: 'Test Organization',
          },
          {
            idempotencyKey: 'the-idempotency-key',
          },
        );

        expect(fetchHeaders()).toMatchObject({
          'Idempotency-Key': 'the-idempotency-key',
        });
        expect(fetchBody()).toEqual({
          domains: ['example.com'],
          name: 'Test Organization',
        });
      });
    });

    describe('with a valid payload', () => {
      describe('with `domains`', () => {
        it('creates an organization', async () => {
          fetchOnce(createOrganization, { status: 201 });

          const subject = await workos.organizations.createOrganization({
            domains: ['example.com'],
            name: 'Test Organization',
          });

          expect(fetchBody()).toEqual({
            domains: ['example.com'],
            name: 'Test Organization',
          });
          expect(subject.id).toEqual('org_01EHT88Z8J8795GZNQ4ZP1J81T');
          expect(subject.name).toEqual('Test Organization');
          expect(subject.domains).toHaveLength(1);
        });
      });

      describe('with `domain_data`', () => {
        it('creates an organization', async () => {
          fetchOnce(createOrganization, { status: 201 });

          const subject = await workos.organizations.createOrganization({
            domainData: [
              { domain: 'example.com', state: DomainDataState.Verified },
            ],
            name: 'Test Organization',
          });

          expect(fetchBody()).toEqual({
            domain_data: [{ domain: 'example.com', state: 'verified' }],
            name: 'Test Organization',
          });
          expect(subject.id).toEqual('org_01EHT88Z8J8795GZNQ4ZP1J81T');
          expect(subject.name).toEqual('Test Organization');
          expect(subject.domains).toHaveLength(1);
        });
      });
    });

    describe('with an invalid payload', () => {
      it('returns an error', async () => {
        fetchOnce(createOrganizationInvalid, {
          status: 409,
          headers: { 'X-Request-ID': 'a-request-id' },
        });

        await expect(
          workos.organizations.createOrganization({
            domains: ['example.com'],
            name: 'Test Organization',
          }),
        ).rejects.toThrowError(
          'An Organization with the domain example.com already exists.',
        );
        expect(fetchBody()).toEqual({
          domains: ['example.com'],
          name: 'Test Organization',
        });
      });
    });
  });

  describe('getOrganization', () => {
    it(`requests an Organization`, async () => {
      fetchOnce(getOrganization);
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      const subject = await workos.organizations.getOrganization(
        'org_01EHT88Z8J8795GZNQ4ZP1J81T',
      );

      expect(fetchURL()).toContain(
        '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T',
      );
      expect(subject.id).toEqual('org_01EHT88Z8J8795GZNQ4ZP1J81T');
      expect(subject.name).toEqual('Test Organization 3');
      expect(subject.allowProfilesOutsideOrganization).toEqual(false);
      expect(subject.domains).toHaveLength(1);
    });
  });

  describe('deleteOrganization', () => {
    it('sends request to delete an Organization', async () => {
      fetchOnce();
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      await workos.organizations.deleteOrganization(
        'org_01EHT88Z8J8795GZNQ4ZP1J81T',
      );

      expect(fetchURL()).toContain(
        '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T',
      );
    });
  });

  describe('updateOrganization', () => {
    describe('with a valid payload', () => {
      describe('with `domains', () => {
        it('updates an organization', async () => {
          fetchOnce(updateOrganization, { status: 201 });

          const subject = await workos.organizations.updateOrganization({
            organization: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            domains: ['example.com'],
            name: 'Test Organization 2',
          });

          expect(fetchBody()).toEqual({
            domains: ['example.com'],
            name: 'Test Organization 2',
          });
          expect(subject.id).toEqual('org_01EHT88Z8J8795GZNQ4ZP1J81T');
          expect(subject.name).toEqual('Test Organization 2');
          expect(subject.domains).toHaveLength(1);
        });
      });

      describe('with `domain_data`', () => {
        it('updates an organization', async () => {
          fetchOnce(updateOrganization, { status: 201 });

          const subject = await workos.organizations.updateOrganization({
            organization: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            domainData: [
              { domain: 'example.com', state: DomainDataState.Verified },
            ],
          });

          expect(fetchBody()).toEqual({
            domain_data: [{ domain: 'example.com', state: 'verified' }],
          });
          expect(subject.id).toEqual('org_01EHT88Z8J8795GZNQ4ZP1J81T');
          expect(subject.name).toEqual('Test Organization 2');
          expect(subject.domains).toHaveLength(1);
        });
      });
    });
  });
});
