import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchSearchParams } from '../common/utils/test-utils';
import {
  DsyncUserUpdatedEvent,
  DsyncUserUpdatedEventResponse,
  Event,
  EventResponse,
  ListResponse,
} from '../common/interfaces';
import { WorkOS } from '../workos';
import { ConnectionType } from '../sso/interfaces';

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
      connectionType: ConnectionType.OktaSAML,
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
            emails: [
              {
                primary: true,
                type: 'type',
                value: 'jonsnow@workos.com',
              },
            ],
            firstName: 'Jon',
            idpId: 'idp_foo',
            lastName: 'Snow',
            jobTitle: 'Knight of the Watch',
            rawAttributes: {},
            state: 'active',
            username: 'jonsnow',
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
            emails: [
              {
                primary: true,
                type: 'type',
                value: 'jonsnow@workos.com',
              },
            ],
            first_name: 'Jon',
            idp_id: 'idp_foo',
            last_name: 'Snow',
            job_title: 'Knight of the Watch',
            raw_attributes: {},
            state: 'active',
            username: 'jonsnow',
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
  });
});
