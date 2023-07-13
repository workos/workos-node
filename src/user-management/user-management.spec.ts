import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { WorkOS } from '../workos';
import userFixture from './fixtures/user.json';

const mock = new MockAdapter(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
const userId = 'user_01H5JQDV7R7ATEYZDEG0W5PRYS';

describe('UserManagement', () => {
  afterEach(() => mock.resetHistory());

  describe('getUser', () => {
    it('sends a Get User request', async () => {
      mock.onGet(`/users/${userId}`).reply(200, userFixture);
      const user = await workos.userManagement.getUser(userId);
      expect(mock.history.get[0].url).toEqual(`/users/${userId}`);
      expect(user).toMatchObject({
        object: 'user',
        id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        email: 'test01@example.com',
        first_name: 'Test 01',
        last_name: 'User',
        identities: [],
        user_type: 'unmanaged',
        email_verified_at: '2023-07-17T20:07:20.055Z',
      });
    });
  });
});
