import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import { EventOptions } from './interfaces/event-options.interface';
import { UnauthorizedException } from '../common/exceptions';
import { WorkOS } from '../workos';

const mock = new MockAdapater(axios);
const event: EventOptions = {
  group: 'WorkOS',
  actor_name: 'WorkOS@example.com',
  actor_id: 'user_1',
  location: ' 192.0.0.8',
  occurred_at: new Date(0),
  target_name: 'Security Audit 2018',
  target_id: 'document_39127',
  action_type: 'U',
  action: 'document.updated',
};

describe('AuditTrail', () => {
  describe('createEvent', () => {
    describe('when the api responds with a 201 CREATED', () => {
      describe('with an idempotency key', () => {
        it('includes an idempotency key with request', async () => {
          mock.onPost().reply(201, { success: true });

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          await expect(
            workos.auditTrail.createEvent(event, {
              idempotencyKey: 'the-idempotency-key',
            }),
          ).resolves.toBeUndefined();

          expect(mock.history.post[0].headers['Idempotency-Key']).toEqual(
            'the-idempotency-key',
          );
        });
      });

      it('posts Event successfully', async () => {
        mock.onPost().reply(201, { success: true });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditTrail.createEvent(event),
        ).resolves.toBeUndefined();
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        mock.onPost().reply(
          401,
          {
            message: 'Unauthorized',
            error: 'error',
            error_description: 'error description',
          },
          { 'X-Request-ID': 'a-request-id' },
        );

        const workos = new WorkOS('invalid apikey');

        await expect(
          workos.auditTrail.createEvent(event),
        ).rejects.toStrictEqual(
          new UnauthorizedException(
            'a-request-id',
            'error',
            'error description',
          ),
        );
      });
    });

    describe('when the api responds with a 422', () => {
      it('throws an UnprocessableEntity', async () => {
        const errors = [
          {
            field: 'target_id',
            code: 'target_id must be a string',
          },
          {
            field: 'occurred_at',
            code: 'occurred_at must be an ISO 8601 date string',
          },
        ];

        mock.onPost().reply(
          422,
          {
            message: 'Validation failed',
            errors,
          },
          { 'X-Request-ID': 'a-request-id' },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditTrail.createEvent(event),
        ).rejects.toMatchSnapshot();
      });
    });
  });

  describe('listEvents', () => {
    describe('With no filters', () => {
      it('Returns all events', async () => {
        mock.onGet().reply(200, {
          data: [
            {
              object: 'event',
              id: 'evt_0',
              group: 'foo-corp.com',
              latitude: null,
              longitude: null,
              location: '::1',
              type: 'r',
              actor_name: 'demo@foo-corp.com',
              actor_id: 'user_0',
              target_name: 'http_request',
              target_id: '',
              metadata: {},
              occurred_at: new Date(),
              action: {
                object: 'event_action',
                id: 'evt_action_0',
                name: 'user.searched_directories',
              },
            },
            {
              object: 'event',
              id: 'evt_1',
              group: 'workos.com',
              location: '::1',
              latitude: null,
              longitude: null,
              type: 'r',
              actor_name: 'foo@example.com',
              actor_id: 'user_1',
              target_name: 'api_key_query',
              target_id: 'key_0',
              metadata: {
                description: 'User viewed API key.',
                x_request_id: '',
              },
              occurred_at: new Date('2020-07-31T14:27:00.384Z'),
              action: {
                object: 'event_action',
                id: 'evt_action_1',
                name: 'user.viewed_api_key',
                project_id: 'project_0',
              },
            },
          ],
          listMetadata: { before: null, after: null },
        });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
        const events = await workos.auditTrail.listEvents();

        expect(events.data).toHaveLength(2);
      });
    });

    describe('With a filter', () => {
      it('Returns events that match the filter', async () => {
        mock.onGet().reply(200, {
          data: [
            {
              object: 'event',
              id: 'evt_0',
              group: 'foo-corp.com',
              latitude: null,
              longitude: null,
              location: '::1',
              type: 'r',
              actor_name: 'demo@foo-corp.com',
              actor_id: 'user_0',
              target_name: 'http_request',
              target_id: '',
              metadata: {},
              occurred_at: new Date(),
              action: {
                object: 'event_action',
                id: 'evt_action_0',
                name: 'user.searched_directories',
              },
            },
          ],
          listMetadata: { before: null, after: null },
        });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
        const events = await workos.auditTrail.listEvents({
          action: ['user.searched_directories'],
        });

        expect(events.data).toHaveLength(1);
        expect(events.data[0].action.name).toEqual('user.searched_directories');
      });
    });
  });
});
