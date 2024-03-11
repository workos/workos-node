import fetch from 'jest-fetch-mock';
import {
  fetchOnce,
  fetchURL,
  fetchSearchParams,
  fetchBody,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import userFixture from './fixtures/user.json';
import listUsersFixture from './fixtures/list-users.json';
import listFactorFixture from './fixtures/list-factors.json';
import organizationMembershipFixture from './fixtures/organization-membership.json';
import listOrganizationMembershipsFixture from './fixtures/list-organization-memberships.json';
import invitationFixture from './fixtures/invitation.json';
import listInvitationsFixture from './fixtures/list-invitations.json';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
const userId = 'user_01H5JQDV7R7ATEYZDEG0W5PRYS';
const organizationMembershipId = 'om_01H5JQDV7R7ATEYZDEG0W5PRYS';
const invitationId = 'invitation_01H5JQDV7R7ATEYZDEG0W5PRYS';

describe('UserManagement', () => {
  beforeEach(() => fetch.resetMocks());

  describe('getUser', () => {
    it('sends a Get User request', async () => {
      fetchOnce(userFixture);
      const user = await workos.userManagement.getUser(userId);
      expect(fetchURL()).toContain(`/user_management/users/${userId}`);
      expect(user).toMatchObject({
        object: 'user',
        id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        email: 'test01@example.com',
        profilePictureUrl: 'https://example.com/profile_picture.jpg',
        firstName: 'Test 01',
        lastName: 'User',
        emailVerified: true,
      });
    });
  });

  describe('listUsers', () => {
    it('lists users', async () => {
      fetchOnce(listUsersFixture);
      const userList = await workos.userManagement.listUsers();
      expect(fetchURL()).toContain('/user_management/users');
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
      fetchOnce(listUsersFixture);
      await workos.userManagement.listUsers({
        email: 'foo@example.com',
        organizationId: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
      });

      expect(fetchSearchParams()).toEqual({
        email: 'foo@example.com',
        organization_id: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: '10',
        order: 'desc',
      });
    });
  });

  describe('createUser', () => {
    it('sends a Create User request', async () => {
      fetchOnce(userFixture);
      const user = await workos.userManagement.createUser({
        email: 'test01@example.com',
        password: 'extra-secure',
        firstName: 'Test 01',
        lastName: 'User',
        emailVerified: true,
      });

      expect(fetchURL()).toContain('/user_management/users');
      expect(user).toMatchObject({
        object: 'user',
        email: 'test01@example.com',
        firstName: 'Test 01',
        lastName: 'User',
        emailVerified: true,
        profilePictureUrl: 'https://example.com/profile_picture.jpg',
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });
  });

  describe('authenticateUserWithMagicAuth', () => {
    it('sends a magic auth authentication request', async () => {
      fetchOnce({ user: userFixture });

      const resp = await workos.userManagement.authenticateWithMagicAuth({
        clientId: 'proj_whatever',
        code: '123456',
        email: userFixture.email,
      });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('authenticateUserWithPassword', () => {
    it('sends an password authentication request', async () => {
      fetchOnce({ user: userFixture });
      const resp = await workos.userManagement.authenticateWithPassword({
        clientId: 'proj_whatever',
        email: 'test01@example.com',
        password: 'extra-secure',
      });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('authenticateUserWithCode', () => {
    it('sends a token authentication request', async () => {
      fetchOnce({ user: userFixture });
      const resp = await workos.userManagement.authenticateWithCode({
        clientId: 'proj_whatever',
        code: 'or this',
      });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(fetchBody()).toEqual({
        client_id: 'proj_whatever',
        client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        code: 'or this',
        grant_type: 'authorization_code',
      });

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('authenticateWithRefreshToken', () => {
    it('sends a refresh_token authentication request', async () => {
      fetchOnce({
        access_token: 'access_token',
        refresh_token: 'refreshToken2',
      });
      const resp = await workos.userManagement.authenticateWithRefreshToken({
        clientId: 'proj_whatever',
        refreshToken: 'refresh_token1',
      });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(fetchBody()).toEqual({
        client_id: 'proj_whatever',
        client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        refresh_token: 'refresh_token1',
        grant_type: 'refresh_token',
      });

      expect(resp).toMatchObject({
        accessToken: 'access_token',
        refreshToken: 'refreshToken2',
      });
    });
  });

  describe('authenticateUserWithTotp', () => {
    it('sends a token authentication request', async () => {
      fetchOnce({ user: userFixture });
      const resp = await workos.userManagement.authenticateWithTotp({
        clientId: 'proj_whatever',
        code: 'or this',
        authenticationChallengeId: 'auth_challenge_01H96FETXGTW1QMBSBT2T36PW0',
        pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
      });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(fetchBody()).toEqual({
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

  describe('authenticateUserWithEmailVerification', () => {
    it('sends an email verification authentication request', async () => {
      fetchOnce({ user: userFixture });
      const resp =
        await workos.userManagement.authenticateWithEmailVerification({
          clientId: 'proj_whatever',
          code: 'or this',
          pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
        });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(fetchBody()).toEqual({
        client_id: 'proj_whatever',
        code: 'or this',
        client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        grant_type: 'urn:workos:oauth:grant-type:email-verification:code',
        pending_authentication_token: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
      });

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });
  });

  describe('authenticateWithOrganizationSelection', () => {
    it('sends an Organization Selection Authentication request', async () => {
      fetchOnce({ user: userFixture });
      const resp =
        await workos.userManagement.authenticateWithOrganizationSelection({
          clientId: 'proj_whatever',
          pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
          organizationId: 'org_01H5JQDV7R7ATEYZDEG0W5PRYS',
        });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(fetchBody()).toEqual({
        client_id: 'proj_whatever',
        client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        grant_type: 'urn:workos:oauth:grant-type:organization-selection',
        pending_authentication_token: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
        organization_id: 'org_01H5JQDV7R7ATEYZDEG0W5PRYS',
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
      fetchOnce({ user: userFixture });

      const resp = await workos.userManagement.sendVerificationEmail({
        userId,
      });

      expect(fetchURL()).toContain(
        `/user_management/users/${userId}/email_verification/send`,
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

    describe('verifyEmail', () => {
      it('sends a Complete Email Verification request', async () => {
        fetchOnce({ user: userFixture });

        const resp = await workos.userManagement.verifyEmail({
          userId,
          code: '123456',
        });

        expect(fetchURL()).toContain(
          `/user_management/users/${userId}/email_verification/confirm`,
        );

        expect(resp.user).toMatchObject({
          email: 'test01@example.com',
        });
      });
    });
  });

  describe('sendMagicAuthCode', () => {
    it('sends a Send Magic Auth Code request', async () => {
      fetchOnce();

      const response = await workos.userManagement.sendMagicAuthCode({
        email: 'bob.loblaw@example.com',
      });

      expect(fetchURL()).toContain('/user_management/magic_auth/send');
      expect(fetchBody()).toEqual({
        email: 'bob.loblaw@example.com',
      });
      expect(response).toBeUndefined();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('sends a Send Password Reset Email request', async () => {
      fetchOnce();
      const resp = await workos.userManagement.sendPasswordResetEmail({
        email: 'test01@example.com',
        passwordResetUrl: 'https://example.com/forgot-password',
      });

      expect(fetchURL()).toContain(`/user_management/password_reset/send`);

      expect(resp).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('sends a Reset Password request', async () => {
      fetchOnce({ user: userFixture });

      const resp = await workos.userManagement.resetPassword({
        token: '',
        newPassword: 'correct horse battery staple',
      });

      expect(fetchURL()).toContain(`/user_management/password_reset/confirm`);

      expect(resp.user).toMatchObject({
        email: 'test01@example.com',
      });
    });
  });

  describe('updateUser', () => {
    it('sends a updateUser request', async () => {
      fetchOnce(userFixture);
      const resp = await workos.userManagement.updateUser({
        userId,
        firstName: 'Dane',
        lastName: 'Williams',
        emailVerified: true,
      });

      expect(fetchURL()).toContain(`/user_management/users/${userId}`);
      expect(fetchBody()).toEqual({
        first_name: 'Dane',
        last_name: 'Williams',
        email_verified: true,
      });
      expect(resp).toMatchObject({
        email: 'test01@example.com',
        profilePictureUrl: 'https://example.com/profile_picture.jpg',
      });
    });

    describe('when only one property is provided', () => {
      it('sends a updateUser request', async () => {
        fetchOnce(userFixture);
        const resp = await workos.userManagement.updateUser({
          userId,
          firstName: 'Dane',
        });

        expect(fetchURL()).toContain(`/user_management/users/${userId}`);
        expect(fetchBody()).toEqual({
          first_name: 'Dane',
        });
        expect(resp).toMatchObject({
          email: 'test01@example.com',
          profilePictureUrl: 'https://example.com/profile_picture.jpg',
        });
      });
    });
  });

  describe('enrollAuthFactor', () => {
    it('sends an enrollAuthFactor request', async () => {
      fetchOnce({
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

      expect(fetchURL()).toContain(
        `/user_management/users/${userId}/auth_factors`,
      );
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
      fetchOnce(listFactorFixture);

      const resp = await workos.userManagement.listAuthFactors({ userId });

      expect(fetchURL()).toContain(
        `/user_management/users/${userId}/auth_factors`,
      );

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
      fetchOnce();

      const resp = await workos.userManagement.deleteUser(userId);

      expect(fetchURL()).toContain(`/user_management/users/${userId}`);
      expect(resp).toBeUndefined();
    });
  });

  describe('getOrganizationMembership', () => {
    it('sends a Get OrganizationMembership request', async () => {
      fetchOnce(organizationMembershipFixture, {
        status: 200,
      });
      const organizationMembership =
        await workos.userManagement.getOrganizationMembership(
          organizationMembershipId,
        );
      expect(fetchURL()).toContain(
        `/user_management/organization_memberships/${organizationMembershipId}`,
      );
      expect(organizationMembership).toMatchObject({
        object: 'organization_membership',
        id: 'om_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
        status: 'active',
      });
    });
  });

  describe('listOrganizationMemberships', () => {
    it('lists organization memberships', async () => {
      fetchOnce(listOrganizationMembershipsFixture, {
        status: 200,
      });
      const organizationMembershipsList =
        await workos.userManagement.listOrganizationMemberships({
          organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
          userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        });
      expect(fetchURL()).toContain('/user_management/organization_memberships');
      expect(organizationMembershipsList).toMatchObject({
        object: 'list',
        data: [
          {
            object: 'organization_membership',
            organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
            userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            status: 'active',
          },
        ],
        listMetadata: {
          before: null,
          after: null,
        },
      });
    });

    it('sends the correct params when filtering', async () => {
      fetchOnce(listOrganizationMembershipsFixture, {
        status: 200,
      });
      await workos.userManagement.listOrganizationMemberships({
        userId: 'user_someuser',
        organizationId: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
      });

      expect(fetchSearchParams()).toEqual({
        user_id: 'user_someuser',
        organization_id: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: '10',
        order: 'desc',
      });
    });
  });

  describe('createOrganizationMembership', () => {
    it('sends a create organization membership request', async () => {
      fetchOnce(organizationMembershipFixture, {
        status: 200,
      });
      const organizationMembership =
        await workos.userManagement.createOrganizationMembership({
          organizationId: 'org_01H5JQDV7R7ATEYZDEG0W5PRYS',
          userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        });

      expect(fetchURL()).toContain('/user_management/organization_memberships');
      expect(organizationMembership).toMatchObject({
        object: 'organization_membership',
        organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        status: 'active',
      });
    });
  });

  describe('deleteOrganizationMembership', () => {
    it('sends a deleteOrganizationMembership request', async () => {
      fetchOnce();

      const resp = await workos.userManagement.deleteOrganizationMembership(
        organizationMembershipId,
      );

      expect(fetchURL()).toContain(
        `/user_management/organization_memberships/${organizationMembershipId}`,
      );
      expect(resp).toBeUndefined();
    });
  });

  describe('getInvitation', () => {
    it('sends a Get Invitation request', async () => {
      fetchOnce(invitationFixture);
      const invitation = await workos.userManagement.getInvitation(
        invitationId,
      );
      expect(fetchURL()).toContain(
        `/user_management/invitations/${invitationId}`,
      );
      expect(invitation).toMatchObject({});
    });
  });

  describe('listInvitations', () => {
    it('lists invitations', async () => {
      fetchOnce(listInvitationsFixture);
      const invitationsList = await workos.userManagement.listInvitations({
        organizationId: 'org_01H5JQDV7R7ATEYZDEG0W5PRYS',
        email: 'dane@workos.com',
      });

      expect(fetchURL()).toContain('/user_management/invitations');
      expect(invitationsList).toMatchObject({
        object: 'list',
        data: [
          {
            object: 'invitation',
            id: 'invitation_01H5JQDV7R7ATEYZDEG0W5PRYS',
            organizationId: 'org_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'dane@workos.com',
          },
        ],
        listMetadata: {
          before: null,
          after: null,
        },
      });
    });

    it('sends the correct params when filtering', async () => {
      fetchOnce(listInvitationsFixture);
      await workos.userManagement.listInvitations({
        organizationId: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
      });

      expect(fetchSearchParams()).toEqual({
        organization_id: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: '10',
        order: 'desc',
      });
    });
  });

  describe('sendInvitation', () => {
    it('sends a Send Invitation request', async () => {
      fetchOnce(invitationFixture);

      const response = await workos.userManagement.sendInvitation({
        email: 'dane@workos.com',
      });

      expect(fetchURL()).toContain('/user_management/invitations');
      expect(fetchBody()).toEqual({
        email: 'dane@workos.com',
      });
      expect(response).toMatchObject({
        object: 'invitation',
        email: 'dane@workos.com',
      });
    });

    it('sends the correct params when provided', async () => {
      fetchOnce(invitationFixture);
      await workos.userManagement.sendInvitation({
        email: 'dane@workos.com',
        organizationId: 'org_someorg',
        expiresInDays: 4,
        inviterUserId: 'user_someuser',
      });

      expect(fetchBody()).toEqual({
        email: 'dane@workos.com',
        organization_id: 'org_someorg',
        expires_in_days: 4,
        inviter_user_id: 'user_someuser',
      });
    });
  });

  describe('revokeInvitation', () => {
    it('send a Revoke Invitation request', async () => {
      const invitationId = 'invitation_01H5JQDV7R7ATEYZDEG0W5PRYS';
      fetchOnce(invitationFixture);

      const response = await workos.userManagement.revokeInvitation(
        invitationId,
      );

      expect(fetchURL()).toContain(
        `/user_management/invitations/${invitationId}/revoke`,
      );
      expect(response).toMatchObject({
        object: 'invitation',
        email: 'dane@workos.com',
      });
    });
  });

  describe('revokeSession', () => {
    it('sends a Revoke Session request', async () => {
      const sessionId = 'session_12345';
      fetchOnce({});

      await workos.userManagement.revokeSession({
        sessionId,
      });

      expect(fetchURL()).toContain('/user_management/sessions/revoke');
      expect(fetchBody()).toEqual({
        session_id: 'session_12345',
      });
    });
  });

  describe('getAuthorizationUrl', () => {
    describe('with no custom api hostname', () => {
      it('generates an authorize url with the default api hostname', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          provider: 'Google',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with no domain or provider', () => {
      it('throws an error for incomplete arguments', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const urlFn = () =>
          workos.userManagement.getAuthorizationUrl({
            clientId: 'proj_123',
            redirectUri: 'example.com/auth/workos/callback',
          });

        expect(urlFn).toThrowErrorMatchingSnapshot();
      });
    });

    describe('with a provider', () => {
      it('generates an authorize url with the provider', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          provider: 'Google',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with a connectionId', () => {
      it('generates an authorize url with the connection', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          connectionId: 'connection_123',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with an organizationId', () => {
      it('generates an authorization URL with the organization', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          organizationId: 'organization_123',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with a custom api hostname', () => {
      it('generates an authorize url with the custom api hostname', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const url = workos.userManagement.getAuthorizationUrl({
          organizationId: 'organization_123',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with state', () => {
      it('generates an authorize url with the provided state', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          organizationId: 'organization_123',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
          state: 'custom state',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with domainHint', () => {
      it('generates an authorize url with the provided domain hint', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          domainHint: 'example.com',
          connectionId: 'connection_123',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
          state: 'custom state',
        });

        expect(url).toMatchInlineSnapshot(
          `"https://api.workos.com/user_management/authorize?client_id=proj_123&connection_id=connection_123&domain_hint=example.com&redirect_uri=example.com%2Fauth%2Fworkos%2Fcallback&response_type=code&state=custom+state"`,
        );
      });
    });

    describe('with loginHint', () => {
      it('generates an authorize url with the provided login hint', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          loginHint: 'foo@workos.com',
          connectionId: 'connection_123',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
          state: 'custom state',
        });

        expect(url).toMatchInlineSnapshot(
          `"https://api.workos.com/user_management/authorize?client_id=proj_123&connection_id=connection_123&login_hint=foo%40workos.com&redirect_uri=example.com%2Fauth%2Fworkos%2Fcallback&response_type=code&state=custom+state"`,
        );
      });
    });
  });

  describe('getLogoutUrl', () => {
    it('returns a logout url', () => {
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      const url = workos.userManagement.getLogoutUrl({
        sessionId: '123456',
      });

      expect(url).toBe(
        'https://api.workos.com/user_management/sessions/logout?session_id=123456',
      );
    });
  });

  describe('getJwksUrl', () => {
    it('returns the jwks url', () => {
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      const url = workos.userManagement.getJwksUrl({
        clientId: 'client_whatever',
      });

      expect(url).toBe(
        'https://api.workos.com/sso/jwks/client_whatever',
      );
    });
  });
});
