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
        firstName: 'Test 01',
        lastName: 'User',
        organizationMemberships: [],
        userType: 'unmanaged',
        emailVerifiedAt: '2023-07-17T20:07:20.055Z',
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
        listMetadata: {
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

  describe('createUser', () => {
    it('sends a Create User request', async () => {
      mock.onPost('/users').reply(200, userFixture);
      const user = await workos.users.createUser({
        email: 'test01@example.com',
        password: 'extra-secure',
        firstName: 'Test 01',
        lastName: 'User',
        emailVerified: true,
      });

      expect(mock.history.post[0].url).toEqual('/users');
      expect(user).toMatchObject({
        object: 'user',
        email: 'test01@example.com',
        firstName: 'Test 01',
        lastName: 'User',
        organizationMemberships: [],
        userType: 'unmanaged',
        emailVerifiedAt: '2023-07-17T20:07:20.055Z',
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });
  });

  describe('authenticateUserWithPassword', () => {
    it('sends an password authentication request', async () => {
      mock.onPost('/users/sessions/token').reply(200, {
        user: userFixture,
        session: sessionFixture,
      });
      const resp = await workos.users.authenticateUserWithPassword({
        clientId: 'proj_whatever',
        email: 'test01@example.com',
        password: 'extra-secure',
      });

      expect(mock.history.post[0].url).toEqual('/users/sessions/token');
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

  describe('authenticateUserWithToken', () => {
    it('sends a token authentication request', async () => {
      mock
        .onPost('/users/sessions/token')
        .reply(200, { user: userFixture, session: sessionFixture });
      const resp = await workos.users.authenticateUserWithToken({
        clientId: 'proj_whatever',
        code: 'or this',
        expiresIn: 15,
      });

      expect(mock.history.post[0].url).toEqual('/users/sessions/token');
      expect(JSON.parse(mock.history.post[0].data)).toMatchObject({
        client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        grant_type: 'authorization_code',
      });

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
        clientId: 'proj_something',
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
        sessionId: 'session_01H5K05VP5CPCXJA5Z7G191GS4',
      });

      expect(mock.history.post[0].url).toEqual('/users/sessions/revocations');
      expect(revoked).toEqual(true);
    });

    it('can revoke with the session_token', async () => {
      mock.onPost('/users/sessions/revocations').reply(200, true);

      const revoked = await workos.users.revokeSession({
        sessionToken: 'really-long-token',
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
        userId,
        verificationUrl: 'https://example.com/verify-email',
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
        mock.onPost(`/users/email_verification`).reply(200, userFixture);

        const resp = await workos.users.completeEmailVerification(
          'email-verification-token',
        );

        expect(mock.history.post[0].url).toEqual(`/users/email_verification`);

        expect(resp).toMatchObject({
          email: 'test01@example.com',
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
        passwordResetUrl: 'https://example.com/forgot-password',
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
      mock.onPost(`/users/password_reset`).reply(200, userFixture);

      const resp = await workos.users.completePasswordReset({
        token: '',
        newPassword: 'correct horse battery staple',
      });

      expect(mock.history.post[0].url).toEqual(`/users/password_reset`);

      expect(resp).toMatchObject({
        email: 'test01@example.com',
      });
    });
  });

  describe('addUserToOrganization', () => {
    it('sends a addUserToOrganization request', async () => {
      mock.onPost(`/users/${userId}/organizations`).reply(200, userFixture);

      const resp = await workos.users.addUserToOrganization({
        userId,
        organizationId: 'org_coolorg',
      });

      expect(mock.history.post[0].url).toEqual(
        `/users/${userId}/organizations`,
      );

      expect(resp).toMatchObject({
        email: 'test01@example.com',
      });
    });
  });

  describe('removeUserFromOrganization', () => {
    it('sends a removeUserFromOrganization request', async () => {
      const orgId = 'org_coolorg';
      mock
        .onDelete(`/users/${userId}/organizations/${orgId}`)
        .reply(200, userFixture);
      const resp = await workos.users.removeUserFromOrganization({
        userId,
        organizationId: orgId,
      });

      expect(mock.history.delete[0].url).toEqual(
        `/users/${userId}/organizations/${orgId}`,
      );

      expect(resp).toMatchObject({
        email: 'test01@example.com',
      });
    });
  });

  describe('updateUser', () => {
    it('sends a updateUser request', async () => {
      mock.onPut(`/users/${userId}`).reply(200, userFixture);
      const resp = await workos.users.updateUser({
        userId,
        firstName: 'Dane',
        lastName: 'Williams',
      });

      expect(mock.history.put[0].url).toEqual(`/users/${userId}`);
      expect(resp).toMatchObject({
        email: 'test01@example.com',
      });
    });
  });

  describe('updateUserPassword', () => {
    it('sends a updateUserPassword request', async () => {
      mock.onPut(`/users/${userId}/password`).reply(200, userFixture);
      const resp = await workos.users.updateUserPassword({
        userId,
        password: 'secure',
      });

      expect(mock.history.put[0].url).toEqual(`/users/${userId}/password`);
      expect(resp).toMatchObject({
        email: 'test01@example.com',
      });
    });
  });
});
