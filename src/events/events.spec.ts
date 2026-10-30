import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchSearchParams } from '../common/utils/test-utils';
import {
  AgentBlueprintCreatedEvent,
  AgentBlueprintCreatedEventResponse,
  AgentBlueprintDeletedEvent,
  AgentBlueprintDeletedEventResponse,
  AgentBlueprintUpdatedEvent,
  AgentBlueprintUpdatedEventResponse,
  AgentInstanceCreatedEvent,
  AgentInstanceCreatedEventResponse,
  AgentInstanceDeletedEvent,
  AgentInstanceDeletedEventResponse,
  AgentInstanceSessionCreatedEvent,
  AgentInstanceSessionCreatedEventResponse,
  AgentInstanceSessionRevokedEvent,
  AgentInstanceSessionRevokedEventResponse,
  AgentRegistrationClaimAttemptCreatedEvent,
  AgentRegistrationClaimAttemptCreatedEventResponse,
  AgentRegistrationClaimCompletedEvent,
  AgentRegistrationClaimCompletedEventResponse,
  AgentRegistrationCreatedEvent,
  AgentRegistrationCreatedEventResponse,
  AgentRegistrationCredentialIssuedEvent,
  AgentRegistrationCredentialIssuedEventResponse,
  AgentRegistrationDeletedEvent,
  AgentRegistrationDeletedEventResponse,
  AgentRegistrationExpiredEvent,
  AgentRegistrationExpiredEventResponse,
  AgentRegistrationOrganizationSwitchedEvent,
  AgentRegistrationOrganizationSwitchedEventResponse,
  AgentRegistrationRefreshedEvent,
  AgentRegistrationRefreshedEventResponse,
  AgentRegistrationRevokedEvent,
  AgentRegistrationRevokedEventResponse,
  DsyncUserUpdatedEvent,
  DsyncUserUpdatedEventResponse,
  Event,
  EventName,
  EventResponse,
  UnknownEvent,
  FlagCreatedEvent,
  FlagCreatedEventResponse,
  GroupCreatedEvent,
  GroupCreatedEventResponse,
  GroupMemberAddedEvent,
  GroupMemberAddedEventResponse,
  GroupMemberRemovedEvent,
  GroupMemberRemovedEventResponse,
  ListResponse,
  OrganizationDomainCreatedEvent,
  OrganizationDomainCreatedEventResponse,
  OrganizationDomainVerificationFailedEvent,
  OrganizationDomainVerificationFailedEventResponse,
  PipesConnectedAccountConnectedEvent,
  PipesConnectedAccountConnectedEventResponse,
  PipesConnectedAccountConnectionFailedEvent,
  PipesConnectedAccountConnectionFailedEventResponse,
  PipesConnectedAccountDisconnectedEvent,
  PipesConnectedAccountDisconnectedEventResponse,
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
    createdAt: new Date('2020-05-06T04:21:48.649Z'),
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
      createdAt: new Date('2020-05-06T04:21:48.649Z'),
      updatedAt: new Date('2020-05-06T04:21:48.649Z'),
    },
  };

  const eventResponse: EventResponse = {
    id: 'event_01234ABCD',
    created_at: '2020-05-06T04:21:48.649Z',
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
      created_at: '2020-05-06T04:21:48.649Z',
      updated_at: '2020-05-06T04:21:48.649Z',
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

    describe('agent blueprint and instance events', () => {
      it('accepts event filters and deserializes payloads', async () => {
        const responseBase = {
          created_at: '2026-10-20T12:00:00.000Z',
          context: { client_id: 'client_123' },
        };
        const eventBase = {
          createdAt: new Date('2026-10-20T12:00:00.000Z'),
          context: { client_id: 'client_123' },
        };

        const blueprintCreatedResponse: AgentBlueprintCreatedEventResponse = {
          ...responseBase,
          id: 'event_blueprint_created',
          event: 'agent.blueprint.created',
          data: {
            object: 'agent_blueprint',
            id: 'agent_blueprint_123',
            name: 'Prospecting Agent',
            description: null,
            permissions: ['crm:read', 'email:send'],
            invocable_by: {
              role_slugs: ['manager'],
              organization_ids: ['org_123'],
            },
            invocable_as: { instance_types: ['delegated', 'autonomous'] },
            session_settings: {
              max_age_seconds: 3600,
              access_token_ttl_seconds: 300,
              refresh_token_ttl_seconds: 3600,
            },
            created_at: '2026-10-20T11:00:00.000Z',
            updated_at: '2026-10-20T11:00:00.000Z',
          },
        };
        const blueprintUpdatedResponse: AgentBlueprintUpdatedEventResponse = {
          ...blueprintCreatedResponse,
          id: 'event_blueprint_updated',
          event: 'agent.blueprint.updated',
          data: {
            ...blueprintCreatedResponse.data,
            description: 'Finds and qualifies sales prospects.',
            invocable_as: { instance_types: ['delegated'] },
            updated_at: '2026-10-20T11:30:00.000Z',
          },
        };
        const blueprintDeletedResponse: AgentBlueprintDeletedEventResponse = {
          ...responseBase,
          id: 'event_blueprint_deleted',
          event: 'agent.blueprint.deleted',
          data: {
            object: 'agent_blueprint',
            id: 'agent_blueprint_123',
            name: 'Prospecting Agent',
            created_at: '2026-10-20T11:00:00.000Z',
            updated_at: '2026-10-20T11:30:00.000Z',
          },
        };
        const instanceCreatedResponse: AgentInstanceCreatedEventResponse = {
          ...responseBase,
          id: 'event_instance_created',
          event: 'agent.instance.created',
          data: {
            object: 'agent_instance',
            id: 'agent_123',
            agent_blueprint_id: 'agent_blueprint_123',
            organization_id: 'org_123',
            organization_membership_id: 'om_123',
            type: 'delegated',
            created_at: '2026-10-20T11:00:00.000Z',
            updated_at: '2026-10-20T11:00:00.000Z',
          },
        };
        const instanceDeletedResponse: AgentInstanceDeletedEventResponse = {
          ...responseBase,
          id: 'event_instance_deleted',
          event: 'agent.instance.deleted',
          data: {
            ...instanceCreatedResponse.data,
            id: 'agent_456',
            organization_membership_id: null,
            type: 'autonomous',
          },
        };
        const sessionCreatedResponse: AgentInstanceSessionCreatedEventResponse =
          {
            ...responseBase,
            id: 'event_session_created',
            event: 'agent.instance.session.created',
            data: {
              object: 'agent_instance_session',
              id: 'agent_session_123',
              agent_instance_id: 'agent_123',
              organization_id: 'org_123',
              expires_at: '2026-10-20T13:00:00.000Z',
              revoked_at: null,
              permission_slugs: ['crm:read'],
              created_at: '2026-10-20T12:00:00.000Z',
              updated_at: '2026-10-20T12:00:00.000Z',
            },
          };
        const sessionRevokedResponse: AgentInstanceSessionRevokedEventResponse =
          {
            id: 'event_session_revoked',
            created_at: '2026-10-20T12:30:00.000Z',
            event: 'agent.instance.session.revoked',
            data: {
              object: 'agent_instance_session',
              id: 'agent_session_123',
              agent_instance_id: 'agent_123',
              organization_id: 'org_123',
              expires_at: '2026-10-20T13:00:00.000Z',
              revoked_at: '2026-10-20T12:30:00.000Z',
              created_at: '2026-10-20T12:00:00.000Z',
              updated_at: '2026-10-20T12:30:00.000Z',
            },
          };

        const blueprintCreated: AgentBlueprintCreatedEvent = {
          ...eventBase,
          id: 'event_blueprint_created',
          event: 'agent.blueprint.created',
          data: {
            object: 'agent_blueprint',
            id: 'agent_blueprint_123',
            name: 'Prospecting Agent',
            description: null,
            permissions: ['crm:read', 'email:send'],
            invocableBy: {
              roleSlugs: ['manager'],
              organizationIds: ['org_123'],
            },
            invocableAs: { instanceTypes: ['delegated', 'autonomous'] },
            sessionSettings: {
              maxAgeSeconds: 3600,
              accessTokenTtlSeconds: 300,
              refreshTokenTtlSeconds: 3600,
            },
            createdAt: new Date('2026-10-20T11:00:00.000Z'),
            updatedAt: new Date('2026-10-20T11:00:00.000Z'),
          },
        };
        const blueprintUpdated: AgentBlueprintUpdatedEvent = {
          ...blueprintCreated,
          id: 'event_blueprint_updated',
          event: 'agent.blueprint.updated',
          data: {
            ...blueprintCreated.data,
            description: 'Finds and qualifies sales prospects.',
            invocableAs: { instanceTypes: ['delegated'] },
            updatedAt: new Date('2026-10-20T11:30:00.000Z'),
          },
        };
        const blueprintDeleted: AgentBlueprintDeletedEvent = {
          ...eventBase,
          id: 'event_blueprint_deleted',
          event: 'agent.blueprint.deleted',
          data: {
            object: 'agent_blueprint',
            id: 'agent_blueprint_123',
            name: 'Prospecting Agent',
            createdAt: new Date('2026-10-20T11:00:00.000Z'),
            updatedAt: new Date('2026-10-20T11:30:00.000Z'),
          },
        };
        const instanceCreated: AgentInstanceCreatedEvent = {
          ...eventBase,
          id: 'event_instance_created',
          event: 'agent.instance.created',
          data: {
            object: 'agent_instance',
            id: 'agent_123',
            agentBlueprintId: 'agent_blueprint_123',
            organizationId: 'org_123',
            organizationMembershipId: 'om_123',
            type: 'delegated',
            createdAt: new Date('2026-10-20T11:00:00.000Z'),
            updatedAt: new Date('2026-10-20T11:00:00.000Z'),
          },
        };
        const instanceDeleted: AgentInstanceDeletedEvent = {
          ...eventBase,
          id: 'event_instance_deleted',
          event: 'agent.instance.deleted',
          data: {
            ...instanceCreated.data,
            id: 'agent_456',
            organizationMembershipId: null,
            type: 'autonomous',
          },
        };
        const sessionCreated: AgentInstanceSessionCreatedEvent = {
          ...eventBase,
          id: 'event_session_created',
          event: 'agent.instance.session.created',
          data: {
            object: 'agent_instance_session',
            id: 'agent_session_123',
            agentInstanceId: 'agent_123',
            organizationId: 'org_123',
            expiresAt: new Date('2026-10-20T13:00:00.000Z'),
            revokedAt: null,
            permissionSlugs: ['crm:read'],
            createdAt: new Date('2026-10-20T12:00:00.000Z'),
            updatedAt: new Date('2026-10-20T12:00:00.000Z'),
          },
        };
        const sessionRevoked: AgentInstanceSessionRevokedEvent = {
          id: 'event_session_revoked',
          createdAt: new Date('2026-10-20T12:30:00.000Z'),
          context: undefined,
          event: 'agent.instance.session.revoked',
          data: {
            object: 'agent_instance_session',
            id: 'agent_session_123',
            agentInstanceId: 'agent_123',
            organizationId: 'org_123',
            expiresAt: new Date('2026-10-20T13:00:00.000Z'),
            revokedAt: new Date('2026-10-20T12:30:00.000Z'),
            createdAt: new Date('2026-10-20T12:00:00.000Z'),
            updatedAt: new Date('2026-10-20T12:30:00.000Z'),
          },
        };

        fetchOnce({
          object: 'list',
          data: [
            blueprintCreatedResponse,
            blueprintUpdatedResponse,
            blueprintDeletedResponse,
            instanceCreatedResponse,
            instanceDeletedResponse,
            sessionCreatedResponse,
            sessionRevokedResponse,
          ],
          list_metadata: {},
        });

        const events: EventName[] = [
          'agent.blueprint.created',
          'agent.blueprint.deleted',
          'agent.blueprint.updated',
          'agent.instance.created',
          'agent.instance.deleted',
          'agent.instance.session.created',
          'agent.instance.session.revoked',
        ];
        const list = await workos.events.listEvents({ events });

        expect(fetchSearchParams()).toMatchObject({
          events: events.join(','),
        });
        expect(list).toEqual({
          object: 'list',
          data: [
            blueprintCreated,
            blueprintUpdated,
            blueprintDeleted,
            instanceCreated,
            instanceDeleted,
            sessionCreated,
            sessionRevoked,
          ],
          listMetadata: {},
        });
      });
    });

    describe('agent registration events', () => {
      it('accepts event filters and deserializes payloads', async () => {
        const responseBase = {
          created_at: '2026-10-20T12:00:00.000Z',
          context: { client_id: 'client_123' },
        };
        const eventBase = {
          createdAt: new Date('2026-10-20T12:00:00.000Z'),
          context: { client_id: 'client_123' },
        };

        const createdResponse: AgentRegistrationCreatedEventResponse = {
          ...responseBase,
          id: 'event_created',
          event: 'agent.registration.created',
          data: {
            object: 'agent_registration',
            id: 'agent_reg_123',
            agent_identity: {
              object: 'agent_identity',
              id: 'agent_identity_123',
              userland_user_id: null,
            },
            organization_id: 'org_123',
            status: 'unverified',
            kind: 'anonymous',
            method: 'anonymous',
            created_at: '2026-10-20T11:00:00.000Z',
            updated_at: '2026-10-20T11:00:00.000Z',
          },
        };
        const claimAttemptCreatedResponse: AgentRegistrationClaimAttemptCreatedEventResponse =
          {
            ...responseBase,
            id: 'event_claim_attempt_created',
            event: 'agent.registration.claim.attempt.created',
            data: {
              object: 'agent_registration_claim_attempt',
              id: 'agent_reg_claim_attempt_123',
              agent_registration_id: 'agent_reg_123',
              agent_registration_claim_id: 'agent_reg_claim_123',
              login_hint: 'jane@example.com',
              expires_at: '2026-10-20T11:05:00.000Z',
              created_at: '2026-10-20T11:00:00.000Z',
              updated_at: '2026-10-20T11:00:00.000Z',
            },
          };
        const claimCompletedResponse: AgentRegistrationClaimCompletedEventResponse =
          {
            ...responseBase,
            id: 'event_claim_completed',
            event: 'agent.registration.claim.completed',
            data: {
              object: 'agent_registration_claim',
              id: 'agent_reg_claim_123',
              agent_registration_id: 'agent_reg_123',
              completed_by_attempt_id: 'agent_reg_claim_attempt_123',
              claimed_by: { user_id: 'user_123', organization_id: null },
              completed_at: '2026-10-20T11:02:00.000Z',
              created_at: '2026-10-20T11:00:00.000Z',
              updated_at: '2026-10-20T11:02:00.000Z',
            },
          };
        const apiKeyIssuedResponse: AgentRegistrationCredentialIssuedEventResponse =
          {
            ...responseBase,
            id: 'event_api_key_issued',
            event: 'agent.registration.credential.issued',
            data: {
              object: 'agent_registration_credential',
              id: 'agent_reg_credential_123',
              agent_registration_id: 'agent_reg_123',
              detail: { kind: 'api_key', api_key_id: 'api_key_123' },
              created_at: '2026-10-20T11:03:00.000Z',
              updated_at: '2026-10-20T11:03:00.000Z',
            },
          };
        const accessTokenIssuedResponse: AgentRegistrationCredentialIssuedEventResponse =
          {
            ...apiKeyIssuedResponse,
            id: 'event_access_token_issued',
            data: {
              ...apiKeyIssuedResponse.data,
              id: 'agent_reg_credential_456',
              detail: {
                kind: 'access_token',
                jti: 'jti_123',
                expires_at: null,
              },
            },
          };
        const organizationSwitchedResponse: AgentRegistrationOrganizationSwitchedEventResponse =
          {
            ...responseBase,
            id: 'event_organization_switched',
            event: 'agent.registration.organization.switched',
            data: {
              agent_registration_id: 'agent_reg_123',
              from_organization_id: 'org_123',
              to_organization_id: 'org_456',
            },
          };
        const lifecycleData = { agent_registration_id: 'agent_reg_123' };
        const refreshedResponse: AgentRegistrationRefreshedEventResponse = {
          ...responseBase,
          id: 'event_refreshed',
          event: 'agent.registration.refreshed',
          data: lifecycleData,
        };
        const expiredResponse: AgentRegistrationExpiredEventResponse = {
          ...responseBase,
          id: 'event_expired',
          event: 'agent.registration.expired',
          data: lifecycleData,
        };
        const revokedResponse: AgentRegistrationRevokedEventResponse = {
          ...responseBase,
          id: 'event_revoked',
          event: 'agent.registration.revoked',
          data: lifecycleData,
        };
        const deletedResponse: AgentRegistrationDeletedEventResponse = {
          id: 'event_deleted',
          created_at: '2026-10-20T12:00:00.000Z',
          event: 'agent.registration.deleted',
          data: lifecycleData,
        };

        const created: AgentRegistrationCreatedEvent = {
          ...eventBase,
          id: 'event_created',
          event: 'agent.registration.created',
          data: {
            object: 'agent_registration',
            id: 'agent_reg_123',
            agentIdentity: {
              object: 'agent_identity',
              id: 'agent_identity_123',
              userlandUserId: null,
            },
            organizationId: 'org_123',
            status: 'unverified',
            kind: 'anonymous',
            method: 'anonymous',
            createdAt: new Date('2026-10-20T11:00:00.000Z'),
            updatedAt: new Date('2026-10-20T11:00:00.000Z'),
          },
        };
        const claimAttemptCreated: AgentRegistrationClaimAttemptCreatedEvent = {
          ...eventBase,
          id: 'event_claim_attempt_created',
          event: 'agent.registration.claim.attempt.created',
          data: {
            object: 'agent_registration_claim_attempt',
            id: 'agent_reg_claim_attempt_123',
            agentRegistrationId: 'agent_reg_123',
            agentRegistrationClaimId: 'agent_reg_claim_123',
            loginHint: 'jane@example.com',
            expiresAt: new Date('2026-10-20T11:05:00.000Z'),
            createdAt: new Date('2026-10-20T11:00:00.000Z'),
            updatedAt: new Date('2026-10-20T11:00:00.000Z'),
          },
        };
        const claimCompleted: AgentRegistrationClaimCompletedEvent = {
          ...eventBase,
          id: 'event_claim_completed',
          event: 'agent.registration.claim.completed',
          data: {
            object: 'agent_registration_claim',
            id: 'agent_reg_claim_123',
            agentRegistrationId: 'agent_reg_123',
            completedByAttemptId: 'agent_reg_claim_attempt_123',
            claimedBy: { userId: 'user_123', organizationId: null },
            completedAt: new Date('2026-10-20T11:02:00.000Z'),
            createdAt: new Date('2026-10-20T11:00:00.000Z'),
            updatedAt: new Date('2026-10-20T11:02:00.000Z'),
          },
        };
        const apiKeyIssued: AgentRegistrationCredentialIssuedEvent = {
          ...eventBase,
          id: 'event_api_key_issued',
          event: 'agent.registration.credential.issued',
          data: {
            object: 'agent_registration_credential',
            id: 'agent_reg_credential_123',
            agentRegistrationId: 'agent_reg_123',
            detail: { kind: 'api_key', apiKeyId: 'api_key_123' },
            createdAt: new Date('2026-10-20T11:03:00.000Z'),
            updatedAt: new Date('2026-10-20T11:03:00.000Z'),
          },
        };
        const accessTokenIssued: AgentRegistrationCredentialIssuedEvent = {
          ...apiKeyIssued,
          id: 'event_access_token_issued',
          data: {
            ...apiKeyIssued.data,
            id: 'agent_reg_credential_456',
            detail: { kind: 'access_token', jti: 'jti_123', expiresAt: null },
          },
        };
        const organizationSwitched: AgentRegistrationOrganizationSwitchedEvent =
          {
            ...eventBase,
            id: 'event_organization_switched',
            event: 'agent.registration.organization.switched',
            data: {
              agentRegistrationId: 'agent_reg_123',
              fromOrganizationId: 'org_123',
              toOrganizationId: 'org_456',
            },
          };
        const lifecycle = { agentRegistrationId: 'agent_reg_123' };
        const refreshed: AgentRegistrationRefreshedEvent = {
          ...eventBase,
          id: 'event_refreshed',
          event: 'agent.registration.refreshed',
          data: lifecycle,
        };
        const expired: AgentRegistrationExpiredEvent = {
          ...eventBase,
          id: 'event_expired',
          event: 'agent.registration.expired',
          data: lifecycle,
        };
        const revoked: AgentRegistrationRevokedEvent = {
          ...eventBase,
          id: 'event_revoked',
          event: 'agent.registration.revoked',
          data: lifecycle,
        };
        const deleted: AgentRegistrationDeletedEvent = {
          id: 'event_deleted',
          createdAt: new Date('2026-10-20T12:00:00.000Z'),
          context: undefined,
          event: 'agent.registration.deleted',
          data: lifecycle,
        };

        fetchOnce({
          object: 'list',
          data: [
            createdResponse,
            claimAttemptCreatedResponse,
            claimCompletedResponse,
            apiKeyIssuedResponse,
            accessTokenIssuedResponse,
            organizationSwitchedResponse,
            refreshedResponse,
            expiredResponse,
            revokedResponse,
            deletedResponse,
          ],
          list_metadata: {},
        });

        const events: EventName[] = [
          'agent.registration.created',
          'agent.registration.claim.attempt.created',
          'agent.registration.claim.completed',
          'agent.registration.credential.issued',
          'agent.registration.organization.switched',
          'agent.registration.refreshed',
          'agent.registration.expired',
          'agent.registration.revoked',
          'agent.registration.deleted',
        ];
        const list = await workos.events.listEvents({ events });

        expect(fetchSearchParams()).toMatchObject({
          events: events.join(','),
        });
        expect(list).toEqual({
          object: 'list',
          data: [
            created,
            claimAttemptCreated,
            claimCompleted,
            apiKeyIssued,
            accessTokenIssued,
            organizationSwitched,
            refreshed,
            expired,
            revoked,
            deleted,
          ],
          listMetadata: {},
        });
      });
    });

    describe('Pipes connected account events', () => {
      it('accepts event filters and deserializes payloads', async () => {
        const connectedResponse: PipesConnectedAccountConnectedEventResponse = {
          id: 'event_connected',
          created_at: '2026-08-25T12:00:00.000Z',
          context: { client_id: 'client_123' },
          event: 'pipes.connected_account.connected',
          data: {
            object: 'connected_account',
            id: 'data_installation_123',
            data_integration_id: 'data_integration_123',
            provider_slug: 'github',
            user_id: 'user_123',
            organization_id: null,
            scopes: ['repo', 'user:email'],
            state: 'connected',
            created_at: '2026-08-25T11:00:00.000Z',
            updated_at: '2026-08-25T12:00:00.000Z',
          },
        };
        const disconnectedResponse: PipesConnectedAccountDisconnectedEventResponse =
          {
            ...connectedResponse,
            id: 'event_disconnected',
            event: 'pipes.connected_account.disconnected',
            data: { ...connectedResponse.data, state: 'disconnected' },
          };
        const connectionFailedResponse: PipesConnectedAccountConnectionFailedEventResponse =
          {
            id: 'event_connection_failed',
            created_at: '2026-08-25T13:00:00.000Z',
            event: 'pipes.connected_account.connection_failed',
            data: {
              object: 'connection_failed',
              data_integration_id: 'data_integration_123',
              provider_slug: 'github',
              user_id: 'user_123',
              organization_id: null,
              error_code: 'authorization_code_exchange_error',
              error_reason: 'The authorization code has expired.',
              provider_error: 'access_denied',
              provider_error_description:
                'The user denied the authorization request.',
              created_at: '2026-08-25T13:00:00.000Z',
            },
          };
        const connected: PipesConnectedAccountConnectedEvent = {
          id: 'event_connected',
          createdAt: new Date('2026-08-25T12:00:00.000Z'),
          context: { client_id: 'client_123' },
          event: 'pipes.connected_account.connected',
          data: {
            object: 'connected_account',
            id: 'data_installation_123',
            dataIntegrationId: 'data_integration_123',
            providerSlug: 'github',
            userId: 'user_123',
            organizationId: null,
            scopes: ['repo', 'user:email'],
            state: 'connected',
            createdAt: new Date('2026-08-25T11:00:00.000Z'),
            updatedAt: new Date('2026-08-25T12:00:00.000Z'),
          },
        };
        const disconnected: PipesConnectedAccountDisconnectedEvent = {
          ...connected,
          id: 'event_disconnected',
          event: 'pipes.connected_account.disconnected',
          data: { ...connected.data, state: 'disconnected' },
        };
        const connectionFailed: PipesConnectedAccountConnectionFailedEvent = {
          id: 'event_connection_failed',
          createdAt: new Date('2026-08-25T13:00:00.000Z'),
          context: undefined,
          event: 'pipes.connected_account.connection_failed',
          data: {
            object: 'connection_failed',
            dataIntegrationId: 'data_integration_123',
            providerSlug: 'github',
            userId: 'user_123',
            organizationId: null,
            errorCode: 'authorization_code_exchange_error',
            errorReason: 'The authorization code has expired.',
            providerError: 'access_denied',
            providerErrorDescription:
              'The user denied the authorization request.',
            createdAt: new Date('2026-08-25T13:00:00.000Z'),
          },
        };

        fetchOnce({
          object: 'list',
          data: [
            connectedResponse,
            disconnectedResponse,
            connectionFailedResponse,
          ],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: [
            'pipes.connected_account.connected',
            'pipes.connected_account.connection_failed',
            'pipes.connected_account.disconnected',
            'pipes.connected_account.reauthorization_needed',
          ],
        });

        expect(list).toEqual({
          object: 'list',
          data: [connected, disconnected, connectionFailed],
          listMetadata: {},
        });
      });

      it('deserializes the current connected account payload fields', async () => {
        const response: PipesConnectedAccountConnectedEventResponse = {
          id: 'event_connected',
          created_at: '2026-10-29T12:00:00.000Z',
          event: 'pipes.connected_account.connected',
          data: {
            object: 'connected_account',
            id: 'data_installation_123',
            connection_role: 'standard',
            account_identifier: 'workspace_123',
            account_display_name: 'Acme production',
            data_integration_id: 'data_integration_123',
            provider_slug: 'github',
            user_id: null,
            organization_id: 'org_123',
            scopes: ['repo'],
            auth_method: 'api_key',
            api_key_last_4: 'cdef',
            state: 'needs_reauthorization',
            established_by_user_id: null,
            state_reason: 'establishing_member_membership_ended',
            created_at: '2026-10-29T11:00:00.000Z',
            updated_at: '2026-10-29T12:00:00.000Z',
          },
        };

        fetchOnce({ object: 'list', data: [response], list_metadata: {} });

        const list = await workos.events.listEvents({
          events: ['pipes.connected_account.connected'],
        });

        expect(list.data[0]).toEqual({
          id: 'event_connected',
          createdAt: new Date('2026-10-29T12:00:00.000Z'),
          context: undefined,
          event: 'pipes.connected_account.connected',
          data: {
            object: 'connected_account',
            id: 'data_installation_123',
            connectionRole: 'standard',
            accountIdentifier: 'workspace_123',
            accountDisplayName: 'Acme production',
            dataIntegrationId: 'data_integration_123',
            providerSlug: 'github',
            userId: null,
            organizationId: 'org_123',
            scopes: ['repo'],
            authMethod: 'api_key',
            apiKeyLast4: 'cdef',
            state: 'needs_reauthorization',
            establishedByUserId: null,
            stateReason: 'establishing_member_membership_ended',
            createdAt: new Date('2026-10-29T11:00:00.000Z'),
            updatedAt: new Date('2026-10-29T12:00:00.000Z'),
          },
        });
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
          createdAt: new Date('2025-08-28T17:56:31.027Z'),
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
            createdAt: new Date('2025-08-28T17:56:30.985Z'),
            updatedAt: new Date('2025-08-28T17:56:30.985Z'),
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

    describe('group events', () => {
      it('deserializes group.created events', async () => {
        const groupCreatedResponse: GroupCreatedEventResponse = {
          id: 'event_01K43DMGDK941Z4YPH6XGHTY3S',
          created_at: '2026-04-20T12:00:00.000Z',
          context: { client_id: 'client_01234ABCD' },
          event: 'group.created',
          data: {
            object: 'group',
            id: 'group_01HXYZ123456789ABCDEFGHIJ',
            organization_id: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            name: 'Engineering',
            description: 'The engineering team',
            created_at: '2026-04-20T12:00:00.000Z',
            updated_at: '2026-04-20T12:00:00.000Z',
          },
        };

        const expected: GroupCreatedEvent = {
          id: 'event_01K43DMGDK941Z4YPH6XGHTY3S',
          createdAt: new Date('2026-04-20T12:00:00.000Z'),
          context: { client_id: 'client_01234ABCD' },
          event: 'group.created',
          data: {
            object: 'group',
            id: 'group_01HXYZ123456789ABCDEFGHIJ',
            organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            name: 'Engineering',
            description: 'The engineering team',
            createdAt: new Date('2026-04-20T12:00:00.000Z'),
            updatedAt: new Date('2026-04-20T12:00:00.000Z'),
          },
        };

        fetchOnce({
          object: 'list',
          data: [groupCreatedResponse],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['group.created'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes group.member_added events', async () => {
        const memberAddedResponse: GroupMemberAddedEventResponse = {
          id: 'event_01K43DMGDK941Z4YPH6XGHTY3T',
          created_at: '2026-04-20T12:00:00.000Z',
          context: { client_id: 'client_01234ABCD' },
          event: 'group.member_added',
          data: {
            group_id: 'group_01HXYZ123456789ABCDEFGHIJ',
            organization_membership_id: 'om_01HXYZ123456789ABCDEFGHIJ',
          },
        };

        const expected: GroupMemberAddedEvent = {
          id: 'event_01K43DMGDK941Z4YPH6XGHTY3T',
          createdAt: new Date('2026-04-20T12:00:00.000Z'),
          context: { client_id: 'client_01234ABCD' },
          event: 'group.member_added',
          data: {
            groupId: 'group_01HXYZ123456789ABCDEFGHIJ',
            organizationMembershipId: 'om_01HXYZ123456789ABCDEFGHIJ',
          },
        };

        fetchOnce({
          object: 'list',
          data: [memberAddedResponse],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['group.member_added'],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      });

      it('deserializes group.member_removed events', async () => {
        const memberRemovedResponse: GroupMemberRemovedEventResponse = {
          id: 'event_01K43DMGDK941Z4YPH6XGHTY3U',
          created_at: '2026-04-20T12:00:00.000Z',
          context: { client_id: 'client_01234ABCD' },
          event: 'group.member_removed',
          data: {
            group_id: 'group_01HXYZ123456789ABCDEFGHIJ',
            organization_membership_id: 'om_01HXYZ123456789ABCDEFGHIJ',
          },
        };

        const expected: GroupMemberRemovedEvent = {
          id: 'event_01K43DMGDK941Z4YPH6XGHTY3U',
          createdAt: new Date('2026-04-20T12:00:00.000Z'),
          context: { client_id: 'client_01234ABCD' },
          event: 'group.member_removed',
          data: {
            groupId: 'group_01HXYZ123456789ABCDEFGHIJ',
            organizationMembershipId: 'om_01HXYZ123456789ABCDEFGHIJ',
          },
        };

        fetchOnce({
          object: 'list',
          data: [memberRemovedResponse],
          list_metadata: {},
        });

        const list = await workos.events.listEvents({
          events: ['group.member_removed'],
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2026-03-24T12:00:00.000Z'),
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
          createdAt: new Date('2020-05-06T04:21:48.649Z'),
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
            name: 'Jon Snow',
            idpId: 'idp_foo',
            lastName: 'Snow',
            rawAttributes: {},
            state: 'active',
            role: { slug: 'super_admin' },
            previousAttributes: {
              role: { slug: 'member' },
            },
            createdAt: new Date('2021-10-27T15:21:50.640Z'),
            updatedAt: new Date('2021-12-13T12:15:45.531Z'),
          },
        };

        const directoryUserUpdatedResponse: DsyncUserUpdatedEventResponse = {
          id: 'event_01234ABCD',
          created_at: '2020-05-06T04:21:48.649Z',
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
            name: 'Jon Snow',
            idp_id: 'idp_foo',
            last_name: 'Snow',
            raw_attributes: {},
            state: 'active',
            role: { slug: 'super_admin' },
            previous_attributes: {
              role: { slug: 'member' },
            },
            created_at: '2021-10-27T15:21:50.640Z',
            updated_at: '2021-12-13T12:15:45.531Z',
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
            createdAt: new Date('2026-04-06T06:24:06.749Z'),
            updatedAt: new Date('2026-04-06T06:24:06.749Z'),
            organizationId: 'org_01TESTORGANIZATION',
            verificationStrategy: OrganizationDomainVerificationStrategy.Manual,
          },
          context: {},
          createdAt: new Date('2026-04-06T06:24:06.776Z'),
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
              createdAt: new Date('2026-03-07T02:24:56.621Z'),
              updatedAt: new Date('2026-04-06T02:25:00.494Z'),
              organizationId: 'org_01TESTORGANIZATION',
              verificationToken: 'FAKETOKEN',
              verificationStrategy: OrganizationDomainVerificationStrategy.Dns,
            },
          },
          context: {},
          createdAt: new Date('2026-04-06T02:26:05.430Z'),
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

    describe('events added with the October 2026 spec sync', () => {
      const createdAt = '2026-10-20T12:00:00.000Z';
      const base = { id: 'event_01NEWEVENT', created_at: createdAt };
      const expectedBase = {
        id: 'event_01NEWEVENT',
        createdAt: new Date(createdAt),
        context: undefined,
      };

      const expectDeserialized = async (
        response: EventResponse,
        expected: Event,
      ) => {
        fetchOnce({ object: 'list', data: [response], list_metadata: {} });

        const list = await workos.events.listEvents({
          events: [response.event as EventName],
        });

        expect(list).toEqual({
          object: 'list',
          data: [expected],
          listMetadata: {},
        });
      };

      it('deserializes action.*.denied events', async () => {
        await expectDeserialized(
          {
            ...base,
            event: 'action.authentication.denied',
            data: {
              action_endpoint_id: 'action_endpoint_01',
              action_execution_id: 'action_execution_01',
              type: 'authentication',
              verdict: 'Deny',
              user_id: 'user_01',
              organization_id: 'org_01',
              email: 'jane@example.com',
              ip_address: '192.0.2.1',
              user_agent: 'Mozilla/5.0',
            },
          },
          {
            ...expectedBase,
            event: 'action.authentication.denied',
            data: {
              actionEndpointId: 'action_endpoint_01',
              actionExecutionId: 'action_execution_01',
              type: 'authentication',
              verdict: 'Deny',
              userId: 'user_01',
              organizationId: 'org_01',
              email: 'jane@example.com',
              ipAddress: '192.0.2.1',
              userAgent: 'Mozilla/5.0',
            },
          },
        );

        await expectDeserialized(
          {
            ...base,
            event: 'action.user_registration.denied',
            data: {
              action_endpoint_id: 'action_endpoint_01',
              action_execution_id: 'action_execution_02',
              type: 'user_registration',
              verdict: 'Deny',
              organization_id: null,
              email: 'jane@example.com',
              ip_address: null,
              user_agent: null,
            },
          },
          {
            ...expectedBase,
            event: 'action.user_registration.denied',
            data: {
              actionEndpointId: 'action_endpoint_01',
              actionExecutionId: 'action_execution_02',
              type: 'user_registration',
              verdict: 'Deny',
              organizationId: null,
              email: 'jane@example.com',
              ipAddress: null,
              userAgent: null,
            },
          },
        );
      });

      it('deserializes api_key.updated events with previous attributes', async () => {
        await expectDeserialized(
          {
            ...base,
            event: 'api_key.updated',
            data: {
              object: 'api_key',
              id: 'api_key_01',
              owner: { type: 'organization', id: 'org_01' },
              name: 'Production Key',
              obfuscated_value: 'sk_…PRYS',
              last_used_at: null,
              expires_at: '2027-01-01T00:00:00.000Z',
              permissions: ['widgets:users-table:manage'],
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-10-20T12:00:00.000Z',
              previous_attributes: { expires_at: null },
            },
          },
          {
            ...expectedBase,
            event: 'api_key.updated',
            data: {
              object: 'api_key',
              id: 'api_key_01',
              owner: { type: 'organization', id: 'org_01' },
              name: 'Production Key',
              obfuscatedValue: 'sk_…PRYS',
              lastUsedAt: null,
              expiresAt: new Date('2027-01-01T00:00:00.000Z'),
              permissions: ['widgets:users-table:manage'],
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              updatedAt: new Date('2026-10-20T12:00:00.000Z'),
              previousAttributes: { expiresAt: null },
            },
          },
        );
      });

      it('deserializes the added authentication.* events', async () => {
        const error = { code: 'invalid_code', message: 'The code is invalid.' };

        await expectDeserialized(
          {
            ...base,
            event: 'authentication.email_verification_failed',
            data: {
              type: 'email_verification',
              status: 'failed',
              ip_address: '192.0.2.1',
              user_agent: 'Mozilla/5.0',
              user_id: 'user_01',
              email: 'jane@example.com',
              error,
            },
          },
          {
            ...expectedBase,
            event: 'authentication.email_verification_failed',
            data: {
              type: 'email_verification',
              status: 'failed',
              ipAddress: '192.0.2.1',
              userAgent: 'Mozilla/5.0',
              userId: 'user_01',
              email: 'jane@example.com',
              error,
            },
          },
        );

        await expectDeserialized(
          {
            ...base,
            event: 'authentication.mfa_failed',
            data: {
              type: 'mfa',
              status: 'failed',
              ip_address: null,
              user_agent: null,
              user_id: 'user_01',
              email: 'jane@example.com',
              error,
            },
          },
          {
            ...expectedBase,
            event: 'authentication.mfa_failed',
            data: {
              type: 'mfa',
              status: 'failed',
              ipAddress: null,
              userAgent: null,
              userId: 'user_01',
              email: 'jane@example.com',
              error,
            },
          },
        );

        await expectDeserialized(
          {
            ...base,
            event: 'authentication.reauthentication_succeeded',
            data: {
              type: 'reauthentication',
              status: 'succeeded',
              ip_address: null,
              user_agent: null,
              user_id: 'user_01',
              email: 'jane@example.com',
            },
          },
          {
            ...expectedBase,
            event: 'authentication.reauthentication_succeeded',
            data: {
              type: 'reauthentication',
              status: 'succeeded',
              ipAddress: null,
              userAgent: null,
              userId: 'user_01',
              email: 'jane@example.com',
            },
          },
        );

        await expectDeserialized(
          {
            ...base,
            event: 'authentication.sso_started',
            data: {
              type: 'sso',
              status: 'started',
              ip_address: null,
              user_agent: null,
              user_id: null,
              email: null,
              sso: {
                organization_id: 'org_01',
                connection_id: 'conn_01',
                session_id: null,
              },
            },
          },
          {
            ...expectedBase,
            event: 'authentication.sso_started',
            data: {
              type: 'sso',
              status: 'started',
              ipAddress: null,
              userAgent: null,
              userId: null,
              email: null,
              sso: {
                organizationId: 'org_01',
                connectionId: 'conn_01',
                sessionId: null,
              },
            },
          },
        );

        await expectDeserialized(
          {
            ...base,
            event: 'authentication.sso_timed_out',
            data: {
              type: 'sso',
              status: 'timed_out',
              ip_address: null,
              user_agent: null,
              user_id: null,
              email: null,
              sso: {
                organization_id: null,
                connection_id: 'conn_01',
                session_id: null,
              },
              error: {
                code: 'sso_timeout',
                message: 'The SSO flow timed out.',
              },
            },
          },
          {
            ...expectedBase,
            event: 'authentication.sso_timed_out',
            data: {
              type: 'sso',
              status: 'timed_out',
              ipAddress: null,
              userAgent: null,
              userId: null,
              email: null,
              sso: {
                organizationId: null,
                connectionId: 'conn_01',
                sessionId: null,
              },
              error: {
                code: 'sso_timeout',
                message: 'The SSO flow timed out.',
              },
            },
          },
        );
      });

      it('deserializes connection.saml_certificate_* events', async () => {
        await expectDeserialized(
          {
            ...base,
            event: 'connection.saml_certificate_renewal_required',
            data: {
              connection: { id: 'conn_01', organization_id: 'org_01' },
              certificate: {
                certificate_type: 'ResponseSigning',
                expiry_date: '2026-11-01T00:00:00.000Z',
                is_expired: false,
              },
              days_until_expiry: 12,
            },
          },
          {
            ...expectedBase,
            event: 'connection.saml_certificate_renewal_required',
            data: {
              connection: { id: 'conn_01', organizationId: 'org_01' },
              certificate: {
                certificateType: 'ResponseSigning',
                expiryDate: new Date('2026-11-01T00:00:00.000Z'),
                isExpired: false,
              },
              daysUntilExpiry: 12,
            },
          },
        );

        await expectDeserialized(
          {
            ...base,
            event: 'connection.saml_certificate_renewed',
            data: {
              connection: { id: 'conn_01' },
              certificate: {
                certificate_type: 'ResponseEncryption',
                expiry_date: '2027-11-01T00:00:00.000Z',
              },
              renewed_at: '2026-10-20T11:00:00.000Z',
            },
          },
          {
            ...expectedBase,
            event: 'connection.saml_certificate_renewed',
            data: {
              connection: { id: 'conn_01' },
              certificate: {
                certificateType: 'ResponseEncryption',
                expiryDate: new Date('2027-11-01T00:00:00.000Z'),
              },
              renewedAt: new Date('2026-10-20T11:00:00.000Z'),
            },
          },
        );
      });

      it('deserializes dsync.token.* events', async () => {
        const token = {
          object: 'directory_token' as const,
          id: 'directory_token_01',
          directory_id: 'directory_01',
          organization_id: 'org_01',
          token_suffix: 'ab12',
          created_at: '2026-10-20T11:00:00.000Z',
        };
        const expectedToken = {
          object: 'directory_token' as const,
          id: 'directory_token_01',
          directoryId: 'directory_01',
          organizationId: 'org_01',
          tokenSuffix: 'ab12',
          createdAt: new Date('2026-10-20T11:00:00.000Z'),
        };

        await expectDeserialized(
          { ...base, event: 'dsync.token.created', data: token },
          {
            ...expectedBase,
            event: 'dsync.token.created',
            data: expectedToken,
          },
        );
        await expectDeserialized(
          { ...base, event: 'dsync.token.revoked', data: token },
          {
            ...expectedBase,
            event: 'dsync.token.revoked',
            data: expectedToken,
          },
        );
      });

      it('deserializes pipes.account_connection.* events', async () => {
        const account = {
          object: 'connected_account' as const,
          id: 'connected_account_01',
          data_integration_id: 'data_integration_01',
          provider_slug: 'github',
          user_id: 'user_01',
          organization_id: null,
          scopes: ['repo'],
          state: 'connected' as const,
          created_at: '2026-10-20T11:00:00.000Z',
          updated_at: '2026-10-20T11:00:00.000Z',
        };
        const expectedAccount = {
          object: 'connected_account' as const,
          id: 'connected_account_01',
          dataIntegrationId: 'data_integration_01',
          providerSlug: 'github',
          userId: 'user_01',
          organizationId: null,
          scopes: ['repo'],
          state: 'connected' as const,
          createdAt: new Date('2026-10-20T11:00:00.000Z'),
          updatedAt: new Date('2026-10-20T11:00:00.000Z'),
        };

        await expectDeserialized(
          {
            ...base,
            event: 'pipes.account_connection.connected',
            data: account,
          },
          {
            ...expectedBase,
            event: 'pipes.account_connection.connected',
            data: expectedAccount,
          },
        );
        await expectDeserialized(
          {
            ...base,
            event: 'pipes.account_connection.disconnected',
            data: account,
          },
          {
            ...expectedBase,
            event: 'pipes.account_connection.disconnected',
            data: expectedAccount,
          },
        );
        await expectDeserialized(
          {
            ...base,
            event: 'pipes.account_connection.reauthorization_needed',
            data: account,
          },
          {
            ...expectedBase,
            event: 'pipes.account_connection.reauthorization_needed',
            data: expectedAccount,
          },
        );

        const failure = {
          object: 'connection_failed' as const,
          data_integration_id: 'data_integration_01',
          provider_slug: 'github',
          user_id: 'user_01',
          organization_id: null,
          account_identifier: 'octocat',
          error_code: 'access_denied',
          error_reason: 'The user cancelled the flow.',
          provider_error: 'access_denied',
          provider_error_description: null,
          created_at: '2026-10-20T11:00:00.000Z',
        };
        const expectedFailure = {
          object: 'connection_failed' as const,
          dataIntegrationId: 'data_integration_01',
          providerSlug: 'github',
          userId: 'user_01',
          organizationId: null,
          accountIdentifier: 'octocat',
          errorCode: 'access_denied',
          errorReason: 'The user cancelled the flow.',
          providerError: 'access_denied',
          providerErrorDescription: null,
          createdAt: new Date('2026-10-20T11:00:00.000Z'),
        };

        await expectDeserialized(
          {
            ...base,
            event: 'pipes.account_connection.add_failed',
            data: failure,
          },
          {
            ...expectedBase,
            event: 'pipes.account_connection.add_failed',
            data: expectedFailure,
          },
        );
        await expectDeserialized(
          {
            ...base,
            event: 'pipes.account_connection.connection_failed',
            data: failure,
          },
          {
            ...expectedBase,
            event: 'pipes.account_connection.connection_failed',
            data: expectedFailure,
          },
        );
      });

      it('deserializes radar.challenge_created events', async () => {
        await expectDeserialized(
          {
            ...base,
            event: 'radar.challenge_created',
            data: {
              type: 'email',
              radar_challenge_id: 'radar_challenge_01',
              user_id: 'user_01',
              email: 'jane@example.com',
            },
          },
          {
            ...expectedBase,
            event: 'radar.challenge_created',
            data: {
              type: 'email',
              radarChallengeId: 'radar_challenge_01',
              userId: 'user_01',
              email: 'jane@example.com',
            },
          },
        );
      });

      it('deserializes resource_export.* events', async () => {
        await expectDeserialized(
          {
            ...base,
            event: 'resource_export.created',
            data: {
              id: 'resource_export_01',
              resource_type: 'auditLogEvents',
            },
          },
          {
            ...expectedBase,
            event: 'resource_export.created',
            data: {
              id: 'resource_export_01',
              resourceType: 'auditLogEvents',
            },
          },
        );
        await expectDeserialized(
          {
            ...base,
            event: 'resource_export.completed',
            data: {
              id: 'resource_export_01',
              resource_type: 'auditLogEvents',
            },
          },
          {
            ...expectedBase,
            event: 'resource_export.completed',
            data: {
              id: 'resource_export_01',
              resourceType: 'auditLogEvents',
            },
          },
        );
        await expectDeserialized(
          {
            ...base,
            event: 'resource_export.downloaded',
            data: {
              id: 'resource_export_01',
              resource_type: 'auditLogEvents',
            },
          },
          {
            ...expectedBase,
            event: 'resource_export.downloaded',
            data: {
              id: 'resource_export_01',
              resourceType: 'auditLogEvents',
            },
          },
        );
        await expectDeserialized(
          {
            ...base,
            event: 'resource_export.failed',
            data: {
              id: 'resource_export_01',
              resource_type: 'auditLogEvents',
            },
          },
          {
            ...expectedBase,
            event: 'resource_export.failed',
            data: {
              id: 'resource_export_01',
              resourceType: 'auditLogEvents',
            },
          },
        );
      });

      it('deserializes the added vault.* events', async () => {
        const actor = {
          actor_id: 'user_01',
          actor_source: 'dashboard' as const,
          actor_name: 'Jane Doe',
        };
        const expectedActor = {
          actorId: 'user_01',
          actorSource: 'dashboard' as const,
          actorName: 'Jane Doe',
        };

        await expectDeserialized(
          {
            ...base,
            event: 'vault.kek.deleted',
            data: { ...actor, key_name: 'primary', key_id: 'key_01' },
          },
          {
            ...expectedBase,
            event: 'vault.kek.deleted',
            data: { ...expectedActor, keyName: 'primary', keyId: 'key_01' },
          },
        );

        await expectDeserialized(
          {
            ...base,
            event: 'vault.dek.rekeyed',
            data: {
              ...actor,
              key_ids: ['key_01', 'key_02'],
              key_context: { organization_id: 'org_01' },
            },
          },
          {
            ...expectedBase,
            event: 'vault.dek.rekeyed',
            data: {
              ...expectedActor,
              keyIds: ['key_01', 'key_02'],
              keyContext: { organization_id: 'org_01' },
            },
          },
        );

        await expectDeserialized(
          {
            ...base,
            event: 'vault.byok_key.deleted',
            data: { organization_id: 'org_01', key_provider: 'AWS_KMS' },
          },
          {
            ...expectedBase,
            event: 'vault.byok_key.deleted',
            data: { organizationId: 'org_01', keyProvider: 'AWS_KMS' },
          },
        );
      });

      it('deserializes waitlist_user.* events', async () => {
        const waitlistUser = {
          object: 'waitlist_user' as const,
          id: 'waitlist_user_01',
          email: 'jane@example.com',
          state: 'approved' as const,
          approved_at: '2026-10-20T11:00:00.000Z',
          additional_fields: { company: 'Acme' },
          waitlist_id: 'waitlist_01',
          created_at: '2026-10-19T11:00:00.000Z',
          updated_at: '2026-10-20T11:00:00.000Z',
        };
        const expectedWaitlistUser = {
          object: 'waitlist_user' as const,
          id: 'waitlist_user_01',
          email: 'jane@example.com',
          state: 'approved' as const,
          approvedAt: new Date('2026-10-20T11:00:00.000Z'),
          additionalFields: { company: 'Acme' },
          waitlistId: 'waitlist_01',
          createdAt: new Date('2026-10-19T11:00:00.000Z'),
          updatedAt: new Date('2026-10-20T11:00:00.000Z'),
        };

        // Entries that have not been approved carry a null approval time.
        const pendingWaitlistUser = {
          ...waitlistUser,
          state: 'pending' as const,
          approved_at: null,
        };
        const expectedPendingWaitlistUser = {
          ...expectedWaitlistUser,
          state: 'pending' as const,
          approvedAt: null,
        };

        await expectDeserialized(
          {
            ...base,
            event: 'waitlist_user.created',
            data: pendingWaitlistUser,
          },
          {
            ...expectedBase,
            event: 'waitlist_user.created',
            data: expectedPendingWaitlistUser,
          },
        );
        await expectDeserialized(
          { ...base, event: 'waitlist_user.approved', data: waitlistUser },
          {
            ...expectedBase,
            event: 'waitlist_user.approved',
            data: expectedWaitlistUser,
          },
        );
        await expectDeserialized(
          {
            ...base,
            event: 'waitlist_user.denied',
            data: { ...pendingWaitlistUser, state: 'denied' },
          },
          {
            ...expectedBase,
            event: 'waitlist_user.denied',
            data: { ...expectedPendingWaitlistUser, state: 'denied' },
          },
        );
      });
    });
  });
});

describe('Unknown events', () => {
  beforeEach(() => fetch.resetMocks());

  const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

  const unknownEventResponse = {
    id: 'event_01HUNKNOWN',
    event: 'widget.frobnicated',
    created_at: '2026-10-20T12:00:00.000Z',
    data: {
      object: 'widget',
      id: 'widget_123',
      frobnicated_at: '2026-10-20T12:00:00.000Z',
    },
  };

  it('passes through an event this version of the SDK does not recognize', async () => {
    fetchOnce({
      object: 'list',
      data: [unknownEventResponse],
      list_metadata: {},
    });

    const list = await workos.events.listEvents({
      events: ['widget.frobnicated' as EventName],
    });

    expect(list.data).toEqual([
      {
        id: 'event_01HUNKNOWN',
        event: 'widget.frobnicated',
        createdAt: new Date('2026-10-20T12:00:00.000Z'),
        context: undefined,
        data: unknownEventResponse.data,
      },
    ]);
  });

  it('surfaces UnknownEvent to exhaustive switches without widening known payloads', () => {
    const describeEvent = (event: Event): string => {
      switch (event.event) {
        case 'user.created':
          // The known payload type is intact: `data` is `User`, not a union.
          return `user:${event.data.email.toLowerCase()}`;
        default: {
          // @ts-expect-error `Event` includes `UnknownEvent`, so `event` is not `never` here.
          const unhandled: never = event;
          return `unknown:${(unhandled as UnknownEvent).event}`;
        }
      }
    };

    const unknownEvent: UnknownEvent = {
      id: 'event_01HUNKNOWN',
      event: 'widget.frobnicated',
      createdAt: new Date('2026-10-20T12:00:00.000Z'),
      context: undefined,
      data: unknownEventResponse.data as never,
    };

    expect(describeEvent(unknownEvent)).toBe('unknown:widget.frobnicated');

    // `never` is assignable to any type, so the raw payload can be read by
    // annotating it rather than casting.
    const payload: Record<string, unknown> = unknownEvent.data;
    expect(payload).toEqual(unknownEventResponse.data);
  });
});
