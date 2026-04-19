import fetch from 'jest-fetch-mock';
import {
  fetchOnce,
  fetchURL,
  fetchSearchParams,
  fetchHeaders,
  fetchBody,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import validateApiKeyFixture from './fixtures/validate-api-key.json';
import listOrganizationApiKeysFixture from './fixtures/list-organization-api-keys.json';
import createOrganizationApiKeyFixture from './fixtures/create-organization-api-key.json';

describe('ApiKeys', () => {
  let workos: WorkOS;

  beforeAll(() => {
    workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
      apiHostname: 'api.workos.test',
      clientId: 'proj_123',
    });
  });

  beforeEach(() => fetch.resetMocks());

  describe('createValidation', () => {
    it('sends a validate API key request', async () => {
      fetchOnce(validateApiKeyFixture);
      const response = await workos.apiKeys.createValidation({
        value: 'sk_123',
      });

      expect(fetchURL()).toContain('/api_keys/validations');
      expect(response).toEqual({
        apiKey: {
          object: 'api_key',
          id: 'api_key_01H5JQDV7R7ATEYZDEG0W5PRYS',
          owner: {
            type: 'organization',
            id: 'org_01H5JQDV7R7ATEYZDEG0W5PRYS',
          },
          name: 'Test Api Key',
          obfuscatedValue: 'sk_…PRYS',
          lastUsedAt: null,
          permissions: ['read', 'write'],
          createdAt: '2023-07-18T02:07:19.911Z',
          updatedAt: '2023-07-18T02:07:19.911Z',
        },
      });
    });

    it('returns null if key is invalid', async () => {
      fetchOnce({ api_key: null });
      const response = await workos.apiKeys.createValidation({
        value: 'invalid',
      });

      expect(fetchURL()).toContain('/api_keys/validations');
      expect(response).toEqual({ apiKey: null });
    });
  });

  describe('deleteApiKey', () => {
    it('sends a delete request', async () => {
      fetchOnce({}, { status: 204 });

      await workos.apiKeys.deleteApiKey('api_key_01H5JQDV7R7ATEYZDEG0W5PRYS');

      expect(fetchURL()).toContain(
        '/api_keys/api_key_01H5JQDV7R7ATEYZDEG0W5PRYS',
      );
    });
  });

  describe('listOrganizationApiKeys', () => {
    it('returns API keys for the organization', async () => {
      fetchOnce(listOrganizationApiKeysFixture);

      const { data, object, listMetadata } =
        await workos.apiKeys.listOrganizationApiKeys({
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
        obfuscatedValue: 'sk_\u2026PRYS',
        lastUsedAt: '2023-07-20T10:30:00.000Z',
        permissions: ['read', 'write'],
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });

    describe('with the limit option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationApiKeysFixture);

        const { data } = await workos.apiKeys.listOrganizationApiKeys({
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

        const { data } = await workos.apiKeys.listOrganizationApiKeys({
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

        const { data } = await workos.apiKeys.listOrganizationApiKeys({
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

      const apiKey = await workos.apiKeys.createOrganizationApiKey({
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
        obfuscatedValue: 'sk_\u20269789',
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

        await workos.apiKeys.createOrganizationApiKey(
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
