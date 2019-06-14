import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import WorkOS from '.';
import {
  NotFoundException,
  InternalServerErrorException,
} from './common/exceptions';
import { RestEntity } from './common/interfaces';

const mock = new MockAdapater(axios);

class InvalidEntity implements RestEntity {
  readonly path = 'invalid';
}
const invalidEntity = new InvalidEntity();

describe('WorkOS', () => {
  describe('post', () => {
    it('throws an NotFoundException when the api returns a 404', async () => {
      mock.onPost().reply(404, { message: 'Not Found' });

      const workos = new WorkOS({
        apiKey: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
      });

      await expect(workos.post(invalidEntity)).rejects.toStrictEqual(
        new NotFoundException(invalidEntity.path),
      );
    });

    it('throws an InternalServerErrorException when the api returns a 500', async () => {
      mock.onPost().reply(500);

      const workos = new WorkOS({
        apiKey: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
      });

      await expect(workos.post(invalidEntity)).rejects.toStrictEqual(
        new InternalServerErrorException(),
      );
    });
  });
});
