import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchSearchParams } from '../common/utils/test-utils';
import {
  DsyncUserUpdatedEvent,
  DsyncUserUpdatedEventResponse,
  Event,
  EventResponse,
  FlagCreatedEvent,
  FlagCreatedEventResponse,
  ListResponse,
  OrganizationDomainCreatedEvent,
  OrganizationDomainCreatedEventResponse,
  OrganizationDomainVerificationFailedEvent,
  OrganizationDomainVerificationFailedEventResponse,
  VaultDataCreatedEvent,
  VaultDataCreatedEventResponse,
  VaultDataUpdatedEvent,
  VaultDataUpdatedEventResponse,
  VaultDataReadEvent,
  VaultDataReadEventResponse,
  VaultDataDeletedEvent,
  VaultDataDeletedEventResponse,
  VaultNamesListedEvent,
  VaultNamesListedEventResponse,
  VaultMetadataReadEvent,
  VaultMetadataReadEventResponse,
  VaultKekCreatedEvent,
  VaultKekCreatedEventResponse,
  VaultDekReadEvent,
  VaultDekReadEventResponse,
  VaultDekDecryptedEvent,
  VaultDekDecryptedEventResponse,
  VaultByokKeyVerificationCompletedEvent,
  VaultByokKeyVerificationCompletedEventResponse,
} from '../common/interfaces';
import { WorkOS } from '../workos';
import { ConnectionType } from '../sso/interfaces';
import {
  OrganizationDomainState,
  OrganizationDomainVerificationStrategy,
} from '../organization-domains/interfaces';

describe('Event', () => {
  beforeEach(() => fetch.resetMocks());

  const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

  const event: Event = {
    id: 'event_01234ABCD',
    createdAt: '2020-05-06 04:21:48.649164',
    context: {
      client_id: 'client_01234ABCD',
    },
    event: 'connection.activated',
    data: {
      object: 'connection',
      id: 'conn_01234ABCD',
      organizationId: 'org_1234',
      name: 'Connection',
      type: ConnectionType.OktaSAML,
      state: 'active',
      domains: [],
      createdAt: '2020-05-06 04:21:48.649164',
      updatedAt: '2020-05-06 04:21:48.649164',
    },
  };

  const eventResponse: EventResponse = {
    id: 'event_01234ABCD',
    created_at: '2020-05-06 04:21:48.649164',
    context: {
      client_id: 'client_01234ABCD',
    },
    event: 'connection.activated',
    data: {
      object: 'connection',
      id: 'conn_01234ABCD',
      organization_id: 'org_1234',
      name: 'Connection',
      connection_type: ConnectionType.OktaSAML,
      state: 'active',
      domains: [],
      created_at: '2020-05-06 04:21:48.649164',
      updated_at: '2020-05-06 04:21:48.649164',
    },
  };

  describe('listEvents', () => {
    const eventsListResponse: ListResponse<EventResponse> = {
      object: 'list',
      data: [eventResponse],
      list_metadata: {},
    };
    describe('with options', () => {
      it('requests Events with query parameters', async () => {
        const eventsResponse: ListResponse<EventResponse> = {
          object: 'list',
          data: [eventResponse],
          list_metadata: {},
        };

        fetchOnce(eventsResponse);

        const list = await workos.events.listEvents({
          events: ['connection.activated'],
          rangeStart: '2020-05-04',
          rangeEnd: '2020-05-07',
        });

        expect(fetchSearchParams()).toMatchObject({
          events: 'connection.activated',
          range_start: '2020-05-04',
          range_end: '2020-05-07',
        });

        expect(list).toEqual({
          object: 'list',
          data: [event],
          listMetadata: {},
        });
      });
    });

    it('sends order parameter in query', async () => {
      fetchOnce(eventsListResponse);

      await workos.events.listEvents({
        events: ['connection.activated'],
        order: 'desc',
      });

      expect(fetchSearchParams()).toMatchObject({
        order: 'desc',
      });
    });

    it(`requests Events with a valid event name`, async () => {
      fetchOnce(eventsListResponse);

      const list = await workos.events.listEvents({
        events: ['connection.activated'],
      });

      expect(list).toEqual({
        object: 'list',
        data: [event],
        listMetadata: {},
      });
    });

    it(`requests Events with a valid organization id`, async () => {
      fetchOnce(eventsListResponse);

      const list = await workos.events.listEvents({
        events: ['connection.activated'],
        organizationId: 'org_1234',
      });

      expect(list).toEqual({
        object: 'list',
        data: [event],
        listMetadata: {},
      });
    });

    describe('feature flag events', () => {
      it('deserializes flag.created events', async () => {
        const flagCreatedResponse: FlagCreatedEventResponse = {
          id: 'event_01K43DMGDK941Z4YPH6XGHTY3S',
          created_at: '2025-08-28T17:56:31.027Z',
          context: {
            client_id: 'client_07FA3DZGSL941Z4YPH6XGHTY3S',
          },
          event: 'flag.created',
          data: {
            object: 'feature_flag',
            id: 'flag_01K43DMGCCK0STXE0EJT2AHQN0',
            name: 'Advanced Audit Logging',
            slug: 'advanced-audit-logging',
            description: '',
            tags: [],
            enabled: false,
            default_value: false,
            created_at: '2025-08-28T17:56:30.985Z',
            updated_at: '2025-08-28T17:56:30.985Z',
          },
        };

        const expected: FlagCreatedEvent = {
          id: 'event_01K43DMGDK941Z4YPH6XGHTY3S',
          createdAt: '2025-08-28T17:56:31.027Z',
          context: {
            client_id: 'client_07FA3DZGSL941Z4YPH6XGHTY3S',
          },
          event: 'flag.created',
          data: {
            object: 'feature_flag',
            id: 'flag_01K43DMGCCK0STXE0EJT2AHQN0',
            name: 'Advanced Audit Logging',
            slug: 'advanced-audit-logging',
            description: '',
            tags: [],
            enabled: false,
            defaultValue: false,
            createdAt: '2025-08-28T17:56:30.985Z',
            updatedAt: '2025-08-28T17:56:30.985Z',
          },
        };

        fetchOnce({
          object: 'list',
          data: [flagCreatedResponse],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['flag.created'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });
    });

    describe('vault events', () => {
      it('deserializes vault.data.created events', async () => {
        const response: VaultDataCreatedEventResponse = {
          id: 'event_01VAULT00001',
          created_at: '2026-03-24T12:00:00.000Z',
          context: { client_id: 'client_01234ABCD' },
          event: 'vault.data.created',
          data: {
            actor_id: 'user_01ABC',
            actor_source: 'dashboard',
            actor_name: 'Jane Doe',
            kv_name: 'secret-key',
            key_id: 'key_01ABC',
            key_context: { env: 'production' },
          },
        };

        const expected: VaultDataCreatedEvent = {
          id: 'event_01VAULT00001',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: { client_id: 'client_01234ABCD' },
          event: 'vault.data.created',
          data: {
            actorId: 'user_01ABC',
            actorSource: 'dashboard',
            actorName: 'Jane Doe',
            kvName: 'secret-key',
            keyId: 'key_01ABC',
            keyContext: { env: 'production' },
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.data.created'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes vault.data.updated events', async () => {
        const response: VaultDataUpdatedEventResponse = {
          id: 'event_01VAULT00002',
          created_at: '2026-03-24T12:00:00.000Z',
          event: 'vault.data.updated',
          data: {
            actor_id: 'user_01ABC',
            actor_source: 'api',
            actor_name: 'API Key',
            kv_name: 'secret-key',
            key_id: 'key_01ABC',
            key_context: { env: 'staging' },
          },
        };

        const expected: VaultDataUpdatedEvent = {
          id: 'event_01VAULT00002',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: undefined,
          event: 'vault.data.updated',
          data: {
            actorId: 'user_01ABC',
            actorSource: 'api',
            actorName: 'API Key',
            kvName: 'secret-key',
            keyId: 'key_01ABC',
            keyContext: { env: 'staging' },
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.data.updated'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes vault.data.read events', async () => {
        const response: VaultDataReadEventResponse = {
          id: 'event_01VAULT00003',
          created_at: '2026-03-24T12:00:00.000Z',
          event: 'vault.data.read',
          data: {
            actor_id: 'user_01ABC',
            actor_source: 'api',
            actor_name: 'API Key',
            kv_name: 'secret-key',
            key_id: 'key_01ABC',
          },
        };

        const expected: VaultDataReadEvent = {
          id: 'event_01VAULT00003',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: undefined,
          event: 'vault.data.read',
          data: {
            actorId: 'user_01ABC',
            actorSource: 'api',
            actorName: 'API Key',
            kvName: 'secret-key',
            keyId: 'key_01ABC',
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.data.read'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes vault.data.deleted events', async () => {
        const response: VaultDataDeletedEventResponse = {
          id: 'event_01VAULT00004',
          created_at: '2026-03-24T12:00:00.000Z',
          event: 'vault.data.deleted',
          data: {
            actor_id: 'user_01ABC',
            actor_source: 'dashboard',
            actor_name: 'Jane Doe',
            kv_name: 'secret-key',
          },
        };

        const expected: VaultDataDeletedEvent = {
          id: 'event_01VAULT00004',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: undefined,
          event: 'vault.data.deleted',
          data: {
            actorId: 'user_01ABC',
            actorSource: 'dashboard',
            actorName: 'Jane Doe',
            kvName: 'secret-key',
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.data.deleted'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes vault.names.listed events', async () => {
        const response: VaultNamesListedEventResponse = {
          id: 'event_01VAULT00005',
          created_at: '2026-03-24T12:00:00.000Z',
          event: 'vault.names.listed',
          data: {
            actor_id: 'user_01ABC',
            actor_source: 'dashboard',
            actor_name: 'Jane Doe',
          },
        };

        const expected: VaultNamesListedEvent = {
          id: 'event_01VAULT00005',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: undefined,
          event: 'vault.names.listed',
          data: {
            actorId: 'user_01ABC',
            actorSource: 'dashboard',
            actorName: 'Jane Doe',
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.names.listed'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes vault.metadata.read events', async () => {
        const response: VaultMetadataReadEventResponse = {
          id: 'event_01VAULT00006',
          created_at: '2026-03-24T12:00:00.000Z',
          event: 'vault.metadata.read',
          data: {
            actor_id: 'user_01ABC',
            actor_source: 'api',
            actor_name: 'API Key',
            kv_name: 'secret-key',
          },
        };

        const expected: VaultMetadataReadEvent = {
          id: 'event_01VAULT00006',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: undefined,
          event: 'vault.metadata.read',
          data: {
            actorId: 'user_01ABC',
            actorSource: 'api',
            actorName: 'API Key',
            kvName: 'secret-key',
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.metadata.read'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes vault.kek.created events', async () => {
        const response: VaultKekCreatedEventResponse = {
          id: 'event_01VAULT00007',
          created_at: '2026-03-24T12:00:00.000Z',
          event: 'vault.kek.created',
          data: {
            actor_id: 'user_01ABC',
            actor_source: 'dashboard',
            actor_name: 'Jane Doe',
            key_name: 'my-kek',
            key_id: 'key_01ABC',
          },
        };

        const expected: VaultKekCreatedEvent = {
          id: 'event_01VAULT00007',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: undefined,
          event: 'vault.kek.created',
          data: {
            actorId: 'user_01ABC',
            actorSource: 'dashboard',
            actorName: 'Jane Doe',
            keyName: 'my-kek',
            keyId: 'key_01ABC',
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.kek.created'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes vault.dek.read events', async () => {
        const response: VaultDekReadEventResponse = {
          id: 'event_01VAULT00008',
          created_at: '2026-03-24T12:00:00.000Z',
          event: 'vault.dek.read',
          data: {
            actor_id: 'user_01ABC',
            actor_source: 'api',
            actor_name: 'API Key',
            key_ids: ['key_01ABC', 'key_02DEF'],
            key_context: { env: 'production' },
          },
        };

        const expected: VaultDekReadEvent = {
          id: 'event_01VAULT00008',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: undefined,
          event: 'vault.dek.read',
          data: {
            actorId: 'user_01ABC',
            actorSource: 'api',
            actorName: 'API Key',
            keyIds: ['key_01ABC', 'key_02DEF'],
            keyContext: { env: 'production' },
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.dek.read'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes vault.byok_key.verification_completed events', async () => {
        const response: VaultByokKeyVerificationCompletedEventResponse = {
          id: 'event_01VAULT00010',
          created_at: '2026-03-24T12:00:00.000Z',
          event: 'vault.byok_key.verification_completed',
          data: {
            organization_id: 'org_01ABC',
            key_provider: 'AWS_KMS',
            verified: true,
          },
        };

        const expected: VaultByokKeyVerificationCompletedEvent = {
          id: 'event_01VAULT00010',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: undefined,
          event: 'vault.byok_key.verification_completed',
          data: {
            organizationId: 'org_01ABC',
            keyProvider: 'AWS_KMS',
            verified: true,
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.byok_key.verification_completed'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes vault.dek.decrypted events', async () => {
        const response: VaultDekDecryptedEventResponse = {
          id: 'event_01VAULT00009',
          created_at: '2026-03-24T12:00:00.000Z',
          event: 'vault.dek.decrypted',
          data: {
            actor_id: 'user_01ABC',
            actor_source: 'api',
            actor_name: 'API Key',
            key_id: 'key_01ABC',
          },
        };

        const expected: VaultDekDecryptedEvent = {
          id: 'event_01VAULT00009',
          createdAt: '2026-03-24T12:00:00.000Z',
          context: undefined,
          event: 'vault.dek.decrypted',
          data: {
            actorId: 'user_01ABC',
            actorSource: 'api',
            actorName: 'API Key',
            keyId: 'key_01ABC',
          },
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['vault.dek.decrypted'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });
    });

    describe('directory user updated events', () => {
      describe('with a role', () => {
        const directoryUserUpdated: DsyncUserUpdatedEvent = {
          id: 'event_01234ABCD',
          createdAt: '2020-05-06 04:21:48.649164',
          context: undefined,
          event: 'dsync.user.updated',
          data: {
            object: 'directory_user',
            id: 'directory_user_456',
            customAttributes: {
              custom: true,
            },
            directoryId: 'dir_123',
            organizationId: 'org_123',
            email: 'jonsnow@workos.com',
            firstName: 'Jon',
            idpId: 'idp_foo',
            lastName: 'Snow',
            rawAttributes: {},
            state: 'active',
            role: { slug: 'super_admin' },
            previousAttributes: {
              role: { slug: 'member' },
            },
            createdAt: '2021-10-27 15:21:50.640959',
            updatedAt: '2021-12-13 12:15:45.531847',
          },
        };

        const directoryUserUpdatedResponse: DsyncUserUpdatedEventResponse = {
          id: 'event_01234ABCD',
          created_at: '2020-05-06 04:21:48.649164',
          event: 'dsync.user.updated',
          data: {
            object: 'directory_user',
            id: 'directory_user_456',
            custom_attributes: {
              custom: true,
            },
            directory_id: 'dir_123',
            organization_id: 'org_123',
            email: 'jonsnow@workos.com',
            first_name: 'Jon',
            idp_id: 'idp_foo',
            last_name: 'Snow',
            raw_attributes: {},
            state: 'active',
            role: { slug: 'super_admin' },
            previous_attributes: {
              role: { slug: 'member' },
            },
            created_at: '2021-10-27 15:21:50.640959',
            updated_at: '2021-12-13 12:15:45.531847',
          },
        };
        const directoryUserEventsListResponse: ListResponse<EventResponse> = {
          object: 'list',
          data: [directoryUserUpdatedResponse],
          list_metadata: {},
        };
        it(`returns the role`, async () => {
          fetchOnce(directoryUserEventsListResponse);

          const list = await workos.events.listEvents({
            events: ['dsync.user.updated'],
          });

          expect(list).toEqual({
            object: 'list',
            data: [directoryUserUpdated],
            listMetadata: {},
          });
        });
      });
    });

    describe('organization domain events', () => {
      it('deserializes organization_domain.created events', async () => {
        const response: OrganizationDomainCreatedEventResponse = {
          event: 'organization_domain.created',
          id: 'event_01DOMAINCREATED001',
          data: {
            id: 'org_domain_01TESTDOMAIN',
            state: OrganizationDomainState.Pending,
            domain: 'example.com',
            object: 'organization_domain',
            created_at: '2026-04-06T06:24:06.749Z',
            updated_at: '2026-04-06T06:24:06.749Z',
            organization_id: 'org_01TESTORGANIZATION',
            verification_strategy:
              OrganizationDomainVerificationStrategy.Manual,
          },
          context: {},
          created_at: '2026-04-06T06:24:06.776Z',
        };

        const expected: OrganizationDomainCreatedEvent = {
          event: 'organization_domain.created',
          id: 'event_01DOMAINCREATED001',
          data: {
            id: 'org_domain_01TESTDOMAIN',
            state: OrganizationDomainState.Pending,
            domain: 'example.com',
            object: 'organization_domain',
            createdAt: '2026-04-06T06:24:06.749Z',
            updatedAt: '2026-04-06T06:24:06.749Z',
            organizationId: 'org_01TESTORGANIZATION',
            verificationStrategy: OrganizationDomainVerificationStrategy.Manual,
          },
          context: {},
          createdAt: '2026-04-06T06:24:06.776Z',
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['organization_domain.created'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes organization_domain.verification_failed events', async () => {
        const response: OrganizationDomainVerificationFailedEventResponse = {
          event: 'organization_domain.verification_failed',
          id: 'event_01DOMAIN0002',
          data: {
            reason: 'domain_verification_period_expired',
            organization_domain: {
              id: 'org_domain_0TESTDOMAIN',
              state: OrganizationDomainState.Failed,
              domain: 'example.com',
              object: 'organization_domain',
              created_at: '2026-03-07T02:24:56.621Z',
              updated_at: '2026-04-06T02:25:00.494Z',
              organization_id: 'org_01TESTORGANIZATION',
              verification_token: 'FAKETOKEN',
              verification_strategy: OrganizationDomainVerificationStrategy.Dns,
            },
          },
          context: {},
          created_at: '2026-04-06T02:26:05.430Z',
        };

        const expected: OrganizationDomainVerificationFailedEvent = {
          event: 'organization_domain.verification_failed',
          id: 'event_01DOMAIN0002',
          data: {
            reason: 'domain_verification_period_expired',
            organizationDomain: {
              id: 'org_domain_0TESTDOMAIN',
              state: OrganizationDomainState.Failed,
              domain: 'example.com',
              object: 'organization_domain',
              createdAt: '2026-03-07T02:24:56.621Z',
              updatedAt: '2026-04-06T02:25:00.494Z',
              organizationId: 'org_01TESTORGANIZATION',
              verificationToken: 'FAKETOKEN',
              verificationStrategy: OrganizationDomainVerificationStrategy.Dns,
            },
          },
          context: {},
          createdAt: '2026-04-06T02:26:05.430Z',
        };

        fetchOnce({
          object: 'list',
          data: [response],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['organization_domain.verification_failed'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });
    });
  });
});
