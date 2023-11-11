import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { WorkOS } from '../workos';
import userFixture from './fixtures/user.json';
import listUsersFixture from './fixtures/list-users.json';
import listFactorFixture from './fixtures/list-factors.json';
import organizationMembershipFixture from './fixtures/organization-membership.json';
import listOrganizationMembershipsFixture from './fixtures/list-organization-memberships.json';

const mock = new MockAdapter(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
const userId = 'user_01H5JQDV7R7ATEYZDEG0W5PRYS';
const organizationMembershipId = 'om_01H5JQDV7R7ATEYZDEG0W5PRYS';

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
        firstName: 'Test 01',
        lastName: 'User',
        emailVerified: true,
      });
    });
  });

  describe('listUsers', () => {
    it('lists users', async () => {
      mock.onGet('/users').reply(200, listUsersFixture);
      const userList = await workos.userManagement.listUsers();
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
      await workos.userManagement.listUsers({
        email: 'foo@example.com',
        organization: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
      });

      expect(mock.history.get[0].params).toEqual({
        email: 'foo@example.com',
        organization: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
        order: 'desc',
      });
    });
  });

  describe('createUser', () => {
    it('sends a Create User request', async () => {
      mock.onPost('/users').reply(200, userFixture);
      const user = await workos.userManagement.createUser({
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
        emailVerified: true,
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });
  });

  describe('authenticateUserWithMagicAuth', () => {
    it('sends a magic auth authentication request', async () => {
      mock.onPost('/users/authenticate').reply(200, {
        user: userFixture,
      });

      const resp = await workos.userManagement.authenticateWithMagicAuth({
        clientId: 'proj_whatever',
        code: '123456',
        userId: userFixture.id,
      });

      expect(mock.history.post[0].url).toEqual('/users/authenticate');
      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('authenticateUserWithPassword', () => {
    it('sends an password authentication request', async () => {
      mock.onPost('/users/authenticate').reply(200, {
        user: userFixture,
      });
      const resp = await workos.userManagement.authenticateWithPassword({
        clientId: 'proj_whatever',
        email: 'test01@example.com',
        password: 'extra-secure',
      });

      expect(mock.history.post[0].url).toEqual('/users/authenticate');
      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('authenticateUserWithCode', () => {
    it('sends a token authentication request', async () => {
      mock.onPost('/users/authenticate').reply(200, { user: userFixture });
      const resp = await workos.userManagement.authenticateWithCode({
        clientId: 'proj_whatever',
        code: 'or this',
      });

      expect(mock.history.post[0].url).toEqual('/users/authenticate');
      expect(JSON.parse(mock.history.post[0].data)).toMatchObject({
        client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        grant_type: 'authorization_code',
      });

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('authenticateUserWithTotp', () => {
    it('sends a token authentication request', async () => {
      mock.onPost('/users/authenticate').reply(200, { user: userFixture });
      const resp = await workos.userManagement.authenticateWithTotp({
        clientId: 'proj_whatever',
        code: 'or this',
        authenticationChallengeId: 'auth_challenge_01H96FETXGTW1QMBSBT2T36PW0',
        pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
      });

      expect(mock.history.post[0].url).toEqual('/users/authenticate');
      expect(JSON.parse(mock.history.post[0].data)).toMatchObject({
        client_id: 'proj_whatever',
        code: 'or this',
        client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        grant_type: 'urn:workos:oauth:grant-type:mfa-totp',
        authentication_challenge_id:
          'auth_challenge_01H96FETXGTW1QMBSBT2T36PW0',
        pending_authentication_token: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
      });

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('sendVerificationEmail', () => {
    it('sends a Create Email Verification Challenge request', async () => {
      mock
        .onPost(`/users/${userId}/send_verification_email`)
        .reply(200, { user: userFixture });

      const resp = await workos.userManagement.sendVerificationEmail({
        userId,
      });

      expect(mock.history.post[0].url).toEqual(
        `/users/${userId}/send_verification_email`,
      );

      expect(resp).toMatchObject({
        user: {
          createdAt: '2023-07-18T02:07:19.911Z',
          email: 'test01@example.com',
          emailVerified: true,
          firstName: 'Test 01',
          id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
          lastName: 'User',
          object: 'user',
          updatedAt: '2023-07-18T02:07:19.911Z',
        },
      });
    });

    describe('verifyEmailCode', () => {
      it('sends a Complete Email Verification request', async () => {
        mock
          .onPost(`/users/user_123/verify_email_code`)
          .reply(200, { user: userFixture });

        const resp = await workos.userManagement.verifyEmailCode({
          userId: 'user_123',
          code: '123456',
        });

        expect(mock.history.post[0].url).toEqual(
          `/users/user_123/verify_email_code`,
        );

        expect(resp.user).toMatchObject({
          email: 'test01@example.com',
        });
      });
    });
  });

  describe('sendMagicAuthCode', () => {
    it('sends a Send Magic Auth Code request', async () => {
      mock
        .onPost('/users/magic_auth/send', {
          email: 'bob.loblaw@example.com',
        })
        .reply(200, {
          user: {
            object: 'user',
            email: 'test01@example.com',
            first_name: 'Test 01',
            last_name: 'User',
            email_verified: true,
            created_at: '2023-07-18T02:07:19.911Z',
            updated_at: '2023-07-18T02:07:19.911Z',
          },
        });

      const response = await workos.userManagement.sendMagicAuthCode({
        email: 'bob.loblaw@example.com',
      });

      expect(mock.history.post[0].url).toEqual('/users/magic_auth/send');

      expect(response).toMatchObject({
        user: {
          object: 'user',
          email: 'test01@example.com',
          firstName: 'Test 01',
          lastName: 'User',
          emailVerified: true,
          createdAt: '2023-07-18T02:07:19.911Z',
          updatedAt: '2023-07-18T02:07:19.911Z',
        },
      });
    });
  });

  describe('createPasswordResetChallenge', () => {
    it('sends a Create Password Reset Challenge request', async () => {
      mock.onPost(`/users/send_password_reset_email`).reply(200, {
        token: 'password-reset-token',
        user: userFixture,
      });
      const resp = await workos.userManagement.sendPasswordResetEmail({
        email: 'test01@example.com',
        passwordResetUrl: 'https://example.com/forgot-password',
      });

      expect(mock.history.post[0].url).toEqual(
        `/users/send_password_reset_email`,
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
      mock.onPost(`/users/password_reset`).reply(200, { user: userFixture });

      const resp = await workos.userManagement.resetPassword({
        token: '',
        newPassword: 'correct horse battery staple',
      });

      expect(mock.history.post[0].url).toEqual(`/users/password_reset`);

      expect(resp.user).toMatchObject({
        email: 'test01@example.com',
      });
    });
  });

  describe('addUserToOrganization', () => {
    it('sends a addUserToOrganization request', async () => {
      mock.onPost(`/users/${userId}/organizations`).reply(200, userFixture);

      const resp = await workos.userManagement.addUserToOrganization({
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
      const resp = await workos.userManagement.removeUserFromOrganization({
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
      const resp = await workos.userManagement.updateUser({
        userId,
        firstName: 'Dane',
        lastName: 'Williams',
        emailVerified: true,
      });

      expect(mock.history.put[0].url).toEqual(`/users/${userId}`);
      expect(JSON.parse(mock.history.put[0].data)).toEqual({
        first_name: 'Dane',
        last_name: 'Williams',
        email_verified: true,
      });
      expect(resp).toMatchObject({
        email: 'test01@example.com',
      });
    });

    describe('when only one property is provided', () => {
      it('sends a updateUser request', async () => {
        mock.onPut(`/users/${userId}`).reply(200, userFixture);
        const resp = await workos.userManagement.updateUser({
          userId,
          firstName: 'Dane',
        });

        expect(mock.history.put[0].url).toEqual(`/users/${userId}`);
        expect(JSON.parse(mock.history.put[0].data)).toEqual({
          first_name: 'Dane',
        });
        expect(resp).toMatchObject({
          email: 'test01@example.com',
        });
      });
    });
  });

  describe('updateUserPassword', () => {
    it('sends a updateUserPassword request', async () => {
      mock.onPut(`/users/${userId}/password`).reply(200, userFixture);
      const resp = await workos.userManagement.updateUserPassword({
        userId,
        password: 'secure',
      });

      expect(mock.history.put[0].url).toEqual(`/users/${userId}/password`);
      expect(resp).toMatchObject({
        email: 'test01@example.com',
      });
    });
  });

  describe('enrollAuthFactor', () => {
    it('sends an enrollAuthFactor request', async () => {
      mock.onPost(`/users/${userId}/auth/factors`).reply(200, {
        authentication_factor: {
          object: 'authentication_factor',
          id: 'auth_factor_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          type: 'totp',
          totp: {
            issuer: 'WorkOS',
            qr_code: 'qr-code-test',
            secret: 'secret-test',
            uri: 'uri-test',
            user: 'some_user',
          },
        },
        authentication_challenge: {
          object: 'authentication_challenge',
          id: 'auth_challenge_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          expires_at: '2022-03-15T21:39:19.892Z',
          code: '12345',
          authentication_factor_id: 'auth_factor_1234',
        },
      });

      const resp = await workos.userManagement.enrollAuthFactor({
        userId,
        type: 'totp',
        totpIssuer: 'WorkOS',
        totpUser: 'some_user',
      });

      expect(mock.history.post[0].url).toEqual(`/users/${userId}/auth/factors`);
      expect(resp).toMatchObject({
        authenticationFactor: {
          object: 'authentication_factor',
          id: 'auth_factor_1234',
          createdAt: '2022-03-15T20:39:19.892Z',
          updatedAt: '2022-03-15T20:39:19.892Z',
          type: 'totp',
          totp: {
            issuer: 'WorkOS',
            qrCode: 'qr-code-test',
            secret: 'secret-test',
            uri: 'uri-test',
            user: 'some_user',
          },
        },
        authenticationChallenge: {
          object: 'authentication_challenge',
          id: 'auth_challenge_1234',
          createdAt: '2022-03-15T20:39:19.892Z',
          updatedAt: '2022-03-15T20:39:19.892Z',
          expiresAt: '2022-03-15T21:39:19.892Z',
          code: '12345',
          authenticationFactorId: 'auth_factor_1234',
        },
      });
    });
  });

  describe('listAuthFactors', () => {
    it('sends a listAuthFactors request', async () => {
      mock.onGet(`/users/${userId}/auth/factors`).reply(200, listFactorFixture);

      const resp = await workos.userManagement.listAuthFactors({ userId });

      expect(mock.history.get[0].url).toEqual(`/users/${userId}/auth/factors`);

      expect(resp).toMatchObject({
        object: 'list',
        data: [
          {
            object: 'authentication_factor',
            id: 'auth_factor_1234',
            createdAt: '2022-03-15T20:39:19.892Z',
            updatedAt: '2022-03-15T20:39:19.892Z',
            type: 'totp',
            totp: {
              issuer: 'WorkOS',
              qrCode: 'qr-code-test',
              secret: 'secret-test',
              uri: 'uri-test',
              user: 'some_user',
            },
          },
        ],
        listMetadata: {
          before: null,
          after: null,
        },
      });
    });
  });

  describe('deleteUser', () => {
    it('sends a deleteUser request', async () => {
      mock.onDelete(`/users/${userId}`).reply(200);

      const resp = await workos.userManagement.deleteUser({
        userId,
      });

      expect(mock.history.delete[0].url).toEqual(`/users/${userId}`);
      expect(resp).toBeUndefined();
    });
  });

  describe('getOrganizationMembership', () => {
    it('sends a Get OrganizationMembership request', async () => {
      mock
        .onGet(`/organization_memberships/${organizationMembershipId}`)
        .reply(200, organizationMembershipFixture);
      const organizationMembership =
        await workos.userManagement.getOrganizationMembership(
          organizationMembershipId,
        );
      expect(mock.history.get[0].url).toEqual(
        `/organization_memberships/${organizationMembershipId}`,
      );
      expect(organizationMembership).toMatchObject({
        object: 'organization_membership',
        id: 'om_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
      });
    });
  });

  describe('listOrganizationMemberships', () => {
    it('lists organization memberships', async () => {
      mock
        .onGet('/organization_memberships')
        .reply(200, listOrganizationMembershipsFixture);
      const organizationMembershipsList =
        await workos.userManagement.listOrganizationMemberships({
          organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
          userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        });
      expect(mock.history.get[0].url).toEqual('/organization_memberships');
      expect(organizationMembershipsList).toMatchObject({
        object: 'list',
        data: [
          {
            object: 'organization_membership',
            organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
            userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
          },
        ],
        listMetadata: {
          before: null,
          after: null,
        },
      });
    });

    it('sends the correct params when filtering', async () => {
      mock.onGet('/users').reply(200, listOrganizationMembershipsFixture);
      await workos.userManagement.listOrganizationMemberships({
        userId: 'user_someuser',
        organizationId: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
      });

      expect(mock.history.get[0].params).toEqual({
        user: 'user_someuser',
        organization: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
        order: 'desc',
      });
    });
  });
});
