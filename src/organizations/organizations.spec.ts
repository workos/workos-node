import fetch from 'jest-fetch-mock';
import {
  fetchOnce,
  fetchURL,
  fetchSearchParams,
  fetchHeaders,
  fetchBody,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import clearStripeCustomerId from './fixtures/clear-stripe-customer-id.json';
import createOrganizationInvalid from './fixtures/create-organization-invalid.json';
import createOrganization from './fixtures/create-organization.json';
import getOrganization from './fixtures/get-organization.json';
import listOrganizationsFixture from './fixtures/list-organizations.json';
import listOrganizationRolesFixture from './fixtures/list-organization-roles.json';
import listOrganizationFeatureFlagsFixture from './fixtures/list-organization-feature-flags.json';
import listOrganizationApiKeysFixture from './fixtures/list-organization-api-keys.json';
import createOrganizationApiKeyFixture from './fixtures/create-organization-api-key.json';
import updateOrganization from './fixtures/update-organization.json';
import setStripeCustomerId from './fixtures/set-stripe-customer-id.json';
import setStripeCustomerIdDisabled from './fixtures/set-stripe-customer-id-disabled.json';
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
            domainData: [
              { domain: 'example.com', state: DomainDataState.Verified },
            ],
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
          domain_data: [
            { domain: 'example.com', state: DomainDataState.Verified },
          ],
          name: 'Test Organization',
        });
      });
    });

    describe('with a valid payload', () => {
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

      it('adds metadata to the request', async () => {
        fetchOnce(createOrganization, { status: 201 });

        await workos.organizations.createOrganization({
          name: 'My organization',
          metadata: { key: 'value' },
        });

        expect(fetchBody()).toMatchObject({
          metadata: { key: 'value' },
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
            domainData: [
              { domain: 'example.com', state: DomainDataState.Verified },
            ],
            name: 'Test Organization',
          }),
        ).rejects.toThrow(
          'An Organization with the domain example.com already exists.',
        );
        expect(fetchBody()).toEqual({
          domain_data: [
            { domain: 'example.com', state: DomainDataState.Verified },
          ],
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
      expect(subject.domains).toEqual([
        {
          object: 'organization_domain',
          id: 'org_domain_01EHT88Z8WZEFWYPM6EC9BX2R8',
          domain: 'example.com',
          state: 'verified',
          verificationStrategy: 'dns',
          verificationToken: 'xB8SeACdKJQP9DP4CahU4YuQZ',
        },
      ]);
    });
  });

  describe('getOrganizationByExternalId', () => {
    it('sends request', async () => {
      const externalId = 'user_external_id';
      const apiResponse = {
        ...getOrganization,
        external_id: externalId,
      };
      fetchOnce(apiResponse);

      const organization =
        await workos.organizations.getOrganizationByExternalId(externalId);

      expect(fetchURL()).toContain(`/organizations/external_id/${externalId}`);
      expect(organization).toMatchObject({
        id: apiResponse.id,
        externalId: apiResponse.external_id,
      });
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

      it('adds metadata to the request', async () => {
        fetchOnce(updateOrganization, { status: 201 });

        await workos.organizations.updateOrganization({
          organization: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
          metadata: { key: 'value' },
        });

        expect(fetchBody()).toEqual({
          metadata: { key: 'value' },
        });
      });
    });

    describe('when given `stripeCustomerId`', () => {
      it('updates the organization’s Stripe customer ID', async () => {
        fetchOnce(setStripeCustomerId);

        const subject = await workos.organizations.updateOrganization({
          organization: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
          stripeCustomerId: 'cus_MX8J9nfK4lP2Yw',
        });

        expect(fetchBody()).toMatchObject({
          stripe_customer_id: 'cus_MX8J9nfK4lP2Yw',
        });

        expect(subject.stripeCustomerId).toBe('cus_MX8J9nfK4lP2Yw');
      });

      it('clears the organization’s Stripe customer ID with a `null` value', async () => {
        fetchOnce(clearStripeCustomerId);

        const subject = await workos.organizations.updateOrganization({
          organization: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
          stripeCustomerId: null,
        });

        expect(fetchBody()).toEqual({
          stripe_customer_id: null,
        });

        expect(subject.stripeCustomerId).toBeUndefined();
      });

      describe('when the feature is not enabled', () => {
        it('returns an error', async () => {
          fetchOnce(setStripeCustomerIdDisabled, { status: 422 });

          await expect(
            workos.organizations.updateOrganization({
              organization: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
              stripeCustomerId: 'cus_MX8J9nfK4lP2Yw',
            }),
          ).rejects.toThrow(
            'stripe_customer_id is not enabled for this environment',
          );

          expect(fetchBody()).toEqual({
            stripe_customer_id: 'cus_MX8J9nfK4lP2Yw',
          });
        });
      });
    });
  });

  describe('listOrganizationRoles', () => {
    it('returns roles for the organization', async () => {
      fetchOnce(listOrganizationRolesFixture);

      const { data, object } = await workos.organizations.listOrganizationRoles(
        {
          organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        },
      );

      expect(fetchURL()).toContain(
        '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/roles',
      );

      expect(object).toEqual('list');
      expect(data).toHaveLength(3);
      expect(data).toEqual([
        {
          object: 'role',
          id: 'role_01EHQMYV6MBK39QC5PZXHY59C5',
          name: 'Admin',
          slug: 'admin',
          description: null,
          permissions: ['posts:create', 'posts:delete'],
          type: 'EnvironmentRole',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          object: 'role',
          id: 'role_01EHQMYV6MBK39QC5PZXHY59C3',
          name: 'Member',
          slug: 'member',
          description: null,
          permissions: [],
          type: 'EnvironmentRole',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          object: 'role',
          id: 'role_01EHQMYV6MBK39QC5PZXHY59C3',
          name: 'OrganizationMember',
          slug: 'org-member',
          description: null,
          permissions: ['posts:read'],
          type: 'OrganizationRole',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]);
    });
  });

  describe('listOrganizationFeatureFlags', () => {
    it('returns feature flags for the organization', async () => {
      fetchOnce(listOrganizationFeatureFlagsFixture);

      const { data, object, listMetadata } =
        await workos.organizations.listOrganizationFeatureFlags({
          organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        });

      expect(fetchURL()).toContain(
        '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/feature-flags',
      );

      expect(object).toEqual('list');
      expect(listMetadata).toEqual({});
      expect(data).toHaveLength(3);
      expect(data).toEqual([
        {
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C5',
          name: 'Advanced Dashboard',
          slug: 'advanced-dashboard',
          description: 'Enable advanced dashboard features',
          tags: ['ui'],
          enabled: true,
          defaultValue: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C6',
          name: 'Beta Features',
          slug: 'beta-features',
          description: '',
          tags: [],
          enabled: false,
          defaultValue: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C7',
          name: 'Premium Support',
          slug: 'premium-support',
          description: 'Access to premium support features',
          tags: ['dev-support'],
          enabled: false,
          defaultValue: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]);
    });

    describe('with the before option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationFeatureFlagsFixture);

        const { data } =
          await workos.organizations.listOrganizationFeatureFlags({
            organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            before: 'flag_before_id',
          });

        expect(fetchSearchParams()).toEqual({
          before: 'flag_before_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/feature-flags',
        );

        expect(data).toHaveLength(3);
      });
    });

    describe('with the after option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationFeatureFlagsFixture);

        const { data } =
          await workos.organizations.listOrganizationFeatureFlags({
            organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            after: 'flag_after_id',
          });

        expect(fetchSearchParams()).toEqual({
          after: 'flag_after_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/feature-flags',
        );

        expect(data).toHaveLength(3);
      });
    });

    describe('with the limit option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationFeatureFlagsFixture);

        const { data } =
          await workos.organizations.listOrganizationFeatureFlags({
            organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            limit: 10,
          });

        expect(fetchSearchParams()).toEqual({
          limit: '10',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/feature-flags',
        );

        expect(data).toHaveLength(3);
      });
    });
  });

  describe('listOrganizationApiKeys', () => {
    it('returns API keys for the organization', async () => {
      fetchOnce(listOrganizationApiKeysFixture);

      const { data, object, listMetadata } =
        await workos.organizations.listOrganizationApiKeys({
          organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        });

      expect(fetchURL()).toContain(
        '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/api_keys',
      );

      expect(object).toEqual('list');
      expect(listMetadata).toEqual({
        before: null,
        after: 'api_key_01H5JQDV7R7ATEYZDEG0W5PRYT',
      });
      expect(data).toHaveLength(2);
      expect(data[0]).toEqual({
        object: 'api_key',
        id: 'api_key_01H5JQDV7R7ATEYZDEG0W5PRYS',
        owner: {
          type: 'organization',
          id: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        },
        name: 'Production Key',
        obfuscatedValue: 'sk_…PRYS',
        lastUsedAt: '2023-07-20T10:30:00.000Z',
        permissions: ['read', 'write'],
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });

    describe('with the limit option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationApiKeysFixture);

        const { data } = await workos.organizations.listOrganizationApiKeys({
          organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
          limit: 10,
        });

        expect(fetchSearchParams()).toEqual({
          limit: '10',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/api_keys',
        );

        expect(data).toHaveLength(2);
      });
    });

    describe('with the before option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationApiKeysFixture);

        const { data } = await workos.organizations.listOrganizationApiKeys({
          organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
          before: 'api_key_before_id',
        });

        expect(fetchSearchParams()).toEqual({
          before: 'api_key_before_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/api_keys',
        );

        expect(data).toHaveLength(2);
      });
    });

    describe('with the after option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationApiKeysFixture);

        const { data } = await workos.organizations.listOrganizationApiKeys({
          organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
          after: 'api_key_after_id',
        });

        expect(fetchSearchParams()).toEqual({
          after: 'api_key_after_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/api_keys',
        );

        expect(data).toHaveLength(2);
      });
    });
  });

  describe('createOrganizationApiKey', () => {
    it('creates an API key for the organization', async () => {
      fetchOnce(createOrganizationApiKeyFixture, { status: 201 });

      const apiKey = await workos.organizations.createOrganizationApiKey({
        organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        name: 'New API Key',
        permissions: ['read', 'write'],
      });

      expect(fetchURL()).toContain(
        '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/api_keys',
      );
      expect(fetchBody()).toEqual({
        name: 'New API Key',
        permissions: ['read', 'write'],
      });
      expect(apiKey).toEqual({
        object: 'api_key',
        id: 'api_key_01H5JQDV7R7ATEYZDEG0W5PRYV',
        owner: {
          type: 'organization',
          id: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        },
        name: 'New API Key',
        obfuscatedValue: 'sk_…9789',
        value: 'sk_live_abc123xyz789',
        lastUsedAt: null,
        permissions: ['read', 'write'],
        createdAt: '2023-07-20T02:07:19.911Z',
        updatedAt: '2023-07-20T02:07:19.911Z',
      });
    });

    describe('with an idempotency key', () => {
      it('includes an idempotency key with request', async () => {
        fetchOnce(createOrganizationApiKeyFixture, { status: 201 });

        await workos.organizations.createOrganizationApiKey(
          {
            organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            name: 'New API Key',
          },
          {
            idempotencyKey: 'the-idempotency-key',
          },
        );

        expect(fetchHeaders()).toMatchObject({
          'Idempotency-Key': 'the-idempotency-key',
        });
      });
    });
  });
});
