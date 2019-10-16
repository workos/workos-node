import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import WorkOS from '../workos';
import { UnauthorizedException } from '../common/exceptions';

const mock = new MockAdapater(axios);
const event = {
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

describe('AuditLog', () => {
  describe('createEvent', () => {
    describe('when the api responds with a 201 CREATED', () => {
      it('posts Event successfully', async () => {
        mock.onPost().reply(201, { success: true });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLog.createEvent(event),
        ).resolves.toBeUndefined();
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        mock.onPost().reply(401, { message: 'Unauthorized' });

        const workos = new WorkOS('invalid apikey');

        await expect(workos.auditLog.createEvent(event)).rejects.toStrictEqual(
          new UnauthorizedException(),
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

        mock.onPost().reply(422, {
          message: 'Validation failed',
          errors,
        });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLog.createEvent(event),
        ).rejects.toMatchSnapshot();
      });
    });
  });
});
