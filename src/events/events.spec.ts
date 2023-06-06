import axios from 'axios';

import MockAdapater from 'axios-mock-adapter';

import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';
import { Event } from './interfaces/event.interface';

const mock = new MockAdapater(axios);

describe('Event', () => {
  afterEach(() => mock.resetHistory());

  const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

  const eventResponse: Event = {
    id: 'event_01234ABCD',
    created_at: '2020-05-06 04:21:48.649164',
    event: 'dsync.user.created',
    data: {
      id: 'event_01234ABCD',
    },
  };

  describe('listEvents', () => {
    const eventsListResponse: List<Event> = {
      object: 'list',
      data: [eventResponse],
      list_metadata: {},
    };

    it(`requests Events`, async () => {
      mock.onGet('/events', {}).replyOnce(200, eventsListResponse);

      const list = await workos.events.listEvents({});

      expect(list).toEqual(eventsListResponse);
    });

    it(`requests Events with a valid event name`, async () => {
      mock.onGet('/events').replyOnce(200, eventsListResponse);

      const list = await workos.events.listEvents({
        events: ['connection.activated'],
      });

      expect(list).toEqual(eventsListResponse);
    });
  });
});
