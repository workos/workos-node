import fetch from 'jest-fetch-mock';
import { fetchOnce } from '../common/utils/test-utils';
import { Event, EventResponse, ListResponse } from '../common/interfaces';
import { WorkOS } from '../workos';
import { ConnectionType } from '../sso/interfaces';

describe('Event', () => {
  beforeEach(() => fetch.resetMocks());

  const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

  const event: Event = {
    id: 'event_01234ABCD',
    createdAt: '2020-05-06 04:21:48.649164',
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

    it(`requests Events`, async () => {
      fetchOnce(eventsListResponse);

      const subject = await workos.events.listEvents({});

      expect(subject).toEqual({
        object: 'list',
        data: [event],
        listMetadata: {},
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
  });
});
