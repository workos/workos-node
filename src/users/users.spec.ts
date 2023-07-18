import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { WorkOS } from '../workos';
import userFixture from './fixtures/user.json';
import listUsersFixture from './fixtures/list-users.json';
import sessionFixture from './fixtures/session.json';

const mock = new MockAdapter(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
const userId = 'user_01H5JQDV7R7ATEYZDEG0W5PRYS';

describe('UserManagement', () => {
  afterEach(() => mock.resetHistory());

  describe('getUser', () => {
    it('sends a Get User request', async () => {
      mock.onGet(`/users/${userId}`).reply(200, userFixture);
      const user = await workos.users.getUser(userId);
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

  describe('listUsers', () => {
    it('lists users', async () => {
      mock.onGet('/users').reply(200, listUsersFixture);
      const userList = await workos.users.listUsers();
      expect(mock.history.get[0].url).toEqual('/users');
      expect(userList).toMatchObject({
        object: 'list',
        data: [
          {
            object: 'user',
            email: 'test01@example.com',
          },
        ],
        list_metadata: {
          before: null,
          after: null,
        },
      });
    });

    it('sends the correct params when filtering', async () => {
      mock.onGet('/users').reply(200, listUsersFixture);
      await workos.users.listUsers({
        email: 'foo@example.com',
        organization: 'org_someorg',
        type: 'managed',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
      });

      expect(mock.history.get[0].params).toEqual({
        email: 'foo@example.com',
        organization: 'org_someorg',
        type: 'managed',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
      });
    });
  });

  describe('createUnmanagedUser', () => {
    it('sends a Create Unmanaged User request', async () => {
      mock.onPost('/users').reply(200, userFixture);
      const user = await workos.users.createUnmanagedUser({
        email: 'test01@example.com',
        password: 'extra-secure',
        first_name: 'Test 01',
        last_name: 'User',
        email_verified: true,
      });

      expect(mock.history.post[0].url).toEqual('/users');
      expect(user).toMatchObject(userFixture);
    });
  });

  describe('authenticateUnmanagedUser', () => {
    it('sends an Authenticate Unmanaged User request', async () => {
      mock.onPost('/users/authentications').reply(200, {
        user: userFixture,
        session: sessionFixture,
      });
      const resp = await workos.users.authenticateUnmanagedUser({
        email: 'test01@example.com',
        password: 'extra-secure',
      });

      expect(mock.history.post[0].url).toEqual('/users/authentications');
      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
        session: {
          id: 'session_01H5K05VP5CPCXJA5Z7G191GS4',
          token: 'really-long-token',
        },
      });
    });
  });

  describe('verifySession', () => {
    it('sends a request to verify the session', async () => {
      mock.onPost('/users/sessions/verify').reply(200, {
        user: userFixture,
        session: sessionFixture,
      });

      const resp = await workos.users.verifySession({
        client_id: 'proj_something',
        token: 'really-long-token',
      });

      expect(mock.history.post[0].url).toEqual('/users/sessions/verify');
      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
        session: {
          id: 'session_01H5K05VP5CPCXJA5Z7G191GS4',
          token: 'really-long-token',
        },
      });
    });
  });

  describe('revokeSession', () => {
    it('can revoke with the session_id', async () => {
      mock.onPost('/users/sessions/revocations').reply(200, true);

      const revoked = await workos.users.revokeSession({
        session_id: 'session_01H5K05VP5CPCXJA5Z7G191GS4',
      });

      expect(mock.history.post[0].url).toEqual('/users/sessions/revocations');
      expect(revoked).toEqual(true);
    });

    it('can revoke with the session_token', async () => {
      mock.onPost('/users/sessions/revocations').reply(200, true);

      const revoked = await workos.users.revokeSession({
        session_token: 'really-long-token',
      });

      expect(mock.history.post[0].url).toEqual('/users/sessions/revocations');
      expect(revoked).toEqual(true);
    });
  });

  describe('revokeAllSessionsForUser', () => {
    it('sends a revokeAllSessionsForUser request', async () => {
      mock.onDelete(`/users/${userId}/sessions`).reply(200, true);
      const revoked = await workos.users.revokeAllSessionsForUser(userId);

      expect(mock.history.delete[0].url).toEqual(`/users/${userId}/sessions`);
      expect(revoked).toEqual(true);
    });
  });

  describe('createEmailVerificationChallenge', () => {
    it('sends a Create Email Verification Challenge request', async () => {
      mock.onPost(`/users/${userId}/email_verification_challenge`).reply(200, {
        token: 'email-verification-challenge',
        user: userFixture,
      });
      const resp = await workos.users.createEmailVerificationChallenge({
        user_id: userId,
        verification_url: 'https://example.com/verify-email',
      });

      expect(mock.history.post[0].url).toEqual(
        `/users/${userId}/email_verification_challenge`,
      );
      expect(resp).toMatchObject({
        token: 'email-verification-challenge',
        user: {
          email: 'test01@example.com',
        },
      });
    });

    describe('completeEmailVerification', () => {
      it('sends a Complete Email Verification request', async () => {
        mock
          .onPost(`/users/email_verification`)
          .reply(200, { user: userFixture });
        const resp = await workos.users.completeEmailVerification(
          'email-verification-token',
        );

        expect(mock.history.post[0].url).toEqual(`/users/email_verification`);

        expect(resp).toMatchObject({
          user: {
            email: 'test01@example.com',
          },
        });
      });
    });
  });

  describe('createPasswordResetChallenge', () => {
    it('sends a Create Password Reset Challenge request', async () => {
      mock.onPost(`/users/password_reset_challenge`).reply(200, {
        token: 'password-reset-token',
        user: userFixture,
      });
      const resp = await workos.users.createPasswordResetChallenge({
        email: 'test01@example.com',
        password_reset_url: 'https://example.com/forgot-password',
      });

      expect(mock.history.post[0].url).toEqual(
        `/users/password_reset_challenge`,
      );

      expect(resp).toMatchObject({
        token: 'password-reset-token',
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('completePasswordReset', () => {
    it('sends a completePasswordReset request', async () => {
      mock.onPost(`/users/password_reset`).reply(200, {
        user: userFixture,
      });
      const resp = await workos.users.completePasswordReset({
        token: '',
        new_password: 'correct horse battery staple',
      });

      expect(mock.history.post[0].url).toEqual(`/users/password_reset`);

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('addUserToOrganization', () => {
    it('sends a addUserToOrganization request', async () => {
      mock.onPost(`/users/${userId}/organizations`).reply(200, {
        user: userFixture,
      });
      const resp = await workos.users.addUserToOrganization({
        user_id: userId,
        organization_id: 'org_coolorg',
      });

      expect(mock.history.post[0].url).toEqual(
        `/users/${userId}/organizations`,
      );

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('removeUserFromOrganization', () => {
    it('sends a removeUserFromOrganization request', async () => {
      const orgId = 'org_coolorg';
      mock.onDelete(`/users/${userId}/organizations/${orgId}`).reply(200, {
        user: userFixture,
      });
      const resp = await workos.users.removeUserFromOrganization({
        user_id: userId,
        organization_id: orgId,
      });

      expect(mock.history.delete[0].url).toEqual(
        `/users/${userId}/organizations/${orgId}`,
      );

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });
});
