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
  actor_name: 'WorkOS@example.com',
  actor_id: 'user_1',
  location: ' 192.0.0.8',
  occurred_at: new Date(0),
  target_name: 'Security Audit 2018',
  target_id: 'document_39127',
  action: 'did.a.thing',
  action_type: 'U',
};

describe('WorkOS', () => {
  describe('createEvent', () => {
    describe('when the api responds with a 201 CREATED', () => {
      it('posts Event successfuly', async () => {
        mock.onPost().reply(201, { success: true });

        const workos = new WorkOS({
          apiKey: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        });

        await expect(workos.createEvent(event)).resolves.toBeUndefined();
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        mock.onPost().reply(401, { message: 'Unauthorized' });

        const workos = new WorkOS({ apiKey: 'invlaid apikey' });

        await expect(workos.createEvent(event)).rejects.toStrictEqual(
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
  });

  describe('post', () => {
    describe('when the api responds with a 404', () => {
      it('throws a NotFoundException', async () => {
        mock.onPost().reply(404, { message: 'Not Found' });

        const workos = new WorkOS({
          apiKey: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        });

        await expect(workos.post({}, '/path')).rejects.toStrictEqual(
          new NotFoundException('/path'),
        );
      });
    });

    describe('when the api responds with a 500', () => {
      it('throws an InternalServerErrorException', async () => {
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
});
