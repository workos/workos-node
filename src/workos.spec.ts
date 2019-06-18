import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import WorkOS from './workos';
import {
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from './common/exceptions';

const mock = new MockAdapater(axios);
const event = {
  group: 'WorkOS',
  actor_name: 'WorkOS@workos.com',
  actor_id: 'user_1',
  location: '208.185.185.131',
  occurred_at: new Date(0),
  target_name: 'Security Audit 2018',
  target_id: 'document_39127',
  action: 'did.a.thing',
  action_type: 'U',
};

describe('WorkOS', () => {
  describe('createEvent', () => {
    it('posts Event successfuly', async () => {
      mock.onPost().reply(201, { success: true });

      const workos = new WorkOS({
        apiKey: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
      });

      await expect(workos.createEvent(event)).resolves.toBeUndefined();
    });

    it('throws an UnauthorizedException when the api returns a 401', async () => {
      mock.onPost().reply(401, { message: 'Unauthorized' });

      const workos = new WorkOS({ apiKey: 'invlaid apikey' });

      await expect(workos.createEvent(event)).rejects.toStrictEqual(
        new UnauthorizedException(),
      );
    });

    it('throws an UnprocessableEntity when the api returns a 422', async () => {
      const errors = [
        {
          field: 'target_id',
          code: 'target_id must be a string',
        },
        {
          field: 'occurred_at',
          code: 'occurred_at must be a ISOString',
        },
      ];

      mock.onPost().reply(422, {
        message: 'Validation failed',
        errors,
      });

      const workos = new WorkOS({
        apiKey: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
      });

      await expect(workos.createEvent(event)).rejects.toStrictEqual(
        new UnprocessableEntityException(errors),
      );
    });
  });

  describe('post', () => {
    it('throws an NotFoundException when the api returns a 404', async () => {
      mock.onPost().reply(404, { message: 'Not Found' });

      const workos = new WorkOS({
        apiKey: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
      });

      await expect(workos.post({}, '/path')).rejects.toStrictEqual(
        new NotFoundException('/path'),
      );
    });

    it('throws an InternalServerErrorException when the api returns a 500', async () => {
      mock.onPost().reply(500);

      const workos = new WorkOS({
        apiKey: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
      });

      await expect(workos.post({}, '/path')).rejects.toStrictEqual(
        new InternalServerErrorException(),
      );
    });
  });
});
