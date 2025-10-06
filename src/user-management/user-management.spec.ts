import fetch from 'jest-fetch-mock';
import {
  fetchBody,
  fetchOnce,
  fetchSearchParams,
  fetchURL,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import deactivateOrganizationMembershipsFixture from './fixtures/deactivate-organization-membership.json';
import emailVerificationFixture from './fixtures/email_verification.json';
import invitationFixture from './fixtures/invitation.json';
import listFactorFixture from './fixtures/list-factors.json';
import listInvitationsFixture from './fixtures/list-invitations.json';
import listOrganizationMembershipsFixture from './fixtures/list-organization-memberships.json';
import listSessionsFixture from './fixtures/list-sessions.json';
import listUsersFixture from './fixtures/list-users.json';
import magicAuthFixture from './fixtures/magic_auth.json';
import organizationMembershipFixture from './fixtures/organization-membership.json';
import passwordResetFixture from './fixtures/password_reset.json';
import userFixture from './fixtures/user.json';
import identityFixture from './fixtures/identity.json';
import * as jose from 'jose';
import { sealData } from 'iron-session';

const userId = 'user_01H5JQDV7R7ATEYZDEG0W5PRYS';
const organizationMembershipId = 'om_01H5JQDV7R7ATEYZDEG0W5PRYS';
const emailVerificationId = 'email_verification_01H5JQDV7R7ATEYZDEG0W5PRYS';
const invitationId = 'invitation_01H5JQDV7R7ATEYZDEG0W5PRYS';
const invitationToken = 'Z1uX3RbwcIl5fIGJJJCXXisdI';
const magicAuthId = 'magic_auth_01H5JQDV7R7ATEYZDEG0W5PRYS';
const passwordResetId = 'password_reset_01H5JQDV7R7ATEYZDEG0W5PRYS';

describe('UserManagement', () => {
  let workos: WorkOS;

  beforeAll(() => {
    workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
      apiHostname: 'api.workos.test',
      clientId: 'proj_123',
    });
  });

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
        lastSignInAt: '2023-07-18T02:07:19.911Z',
        locale: 'en-US',
      });
    });
  });

  describe('getUserByExternalId', () => {
    it('sends a Get User request', async () => {
      const externalId = 'user_external_id';
      fetchOnce({ ...userFixture, external_id: externalId });

      const user = await workos.userManagement.getUserByExternalId(externalId);
      expect(fetchURL()).toContain(
        `/user_management/users/external_id/${externalId}`,
      );
      expect(user).toMatchObject({
        object: 'user',
        id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        email: 'test01@example.com',
        profilePictureUrl: 'https://example.com/profile_picture.jpg',
        firstName: 'Test 01',
        lastName: 'User',
        emailVerified: true,
        lastSignInAt: '2023-07-18T02:07:19.911Z',
        locale: 'en-US',
        externalId,
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

    it('adds metadata to the request', async () => {
      fetchOnce(userFixture);

      await workos.userManagement.createUser({
        email: 'test01@example.com',
        metadata: { key: 'value' },
      });

      expect(fetchBody()).toMatchObject({
        metadata: { key: 'value' },
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

    describe('when sealSession = true', () => {
      beforeEach(() => {
        fetchOnce({
          user: userFixture,
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
      });

      describe('when the cookie password is undefined', () => {
        it('throws an error', async () => {
          await expect(
            workos.userManagement.authenticateWithMagicAuth({
              clientId: 'proj_whatever',
              code: '123456',
              email: userFixture.email,
              session: { sealSession: true },
            }),
          ).rejects.toThrow('Cookie password is required');
        });
      });

      describe('when successfully authenticated', () => {
        it('returns the sealed session data', async () => {
          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const response =
            await workos.userManagement.authenticateWithMagicAuth({
              clientId: 'proj_whatever',
              code: '123456',
              email: userFixture.email,
              session: { sealSession: true, cookiePassword },
            });

          expect(response).toEqual({
            sealedSession: expect.any(String),
            accessToken: expect.any(String),
            authenticationMethod: undefined,
            impersonator: undefined,
            organizationId: undefined,
            refreshToken: undefined,
            user: expect.objectContaining({
              email: 'test01@example.com',
            }),
          });
        });
      });
    });
  });

  describe('authenticateWithPassword', () => {
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

    describe('when sealSession = true', () => {
      beforeEach(() => {
        fetchOnce({
          user: userFixture,
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
      });

      describe('when the cookie password is undefined', () => {
        it('throws an error', async () => {
          await expect(
            workos.userManagement.authenticateWithPassword({
              clientId: 'proj_whatever',
              email: 'test01@example.com',
              password: 'extra-secure',
              session: { sealSession: true },
            }),
          ).rejects.toThrow('Cookie password is required');
        });
      });

      describe('when successfully authenticated', () => {
        it('returns the sealed session data', async () => {
          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const response = await workos.userManagement.authenticateWithPassword(
            {
              clientId: 'proj_whatever',
              email: 'test01@example.com',
              password: 'extra-secure',
              session: { sealSession: true, cookiePassword },
            },
          );

          expect(response).toEqual({
            sealedSession: expect.any(String),
            accessToken: expect.any(String),
            authenticationMethod: undefined,
            impersonator: undefined,
            organizationId: undefined,
            refreshToken: undefined,
            user: expect.objectContaining({
              email: 'test01@example.com',
            }),
          });
        });
      });
    });
  });

  describe('authenticateWithCode', () => {
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

    it('sends a token authentication request when including the code_verifier', async () => {
      fetchOnce({ user: userFixture });
      const resp = await workos.userManagement.authenticateWithCode({
        clientId: 'proj_whatever',
        code: 'or this',
        codeVerifier: 'code_verifier_value',
      });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(fetchBody()).toEqual({
        client_id: 'proj_whatever',
        client_secret: 'sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU',
        code: 'or this',
        code_verifier: 'code_verifier_value',
        grant_type: 'authorization_code',
      });

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });

    it('deserializes authentication_method', async () => {
      fetchOnce({
        user: userFixture,
        authentication_method: 'Password',
      });

      const resp = await workos.userManagement.authenticateWithCode({
        clientId: 'proj_whatever',
        code: 'or this',
      });

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
        authenticationMethod: 'Password',
      });
    });

    describe('when the code is for an impersonator', () => {
      it('deserializes the impersonator metadata', async () => {
        fetchOnce({
          user: userFixture,
          impersonator: {
            email: 'admin@example.com',
            reason: 'A good reason.',
          },
        });
        const resp = await workos.userManagement.authenticateWithCode({
          clientId: 'proj_whatever',
          code: 'or this',
        });

        expect(resp).toMatchObject({
          user: {
            email: 'test01@example.com',
          },
          impersonator: {
            email: 'admin@example.com',
            reason: 'A good reason.',
          },
        });
      });
    });

    describe('when sealSession = true', () => {
      beforeEach(() => {
        fetchOnce({
          user: userFixture,
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
      });

      describe('when the cookie password is undefined', () => {
        it('throws an error', async () => {
          await expect(
            workos.userManagement.authenticateWithCode({
              clientId: 'proj_whatever',
              code: 'or this',
              session: { sealSession: true },
            }),
          ).rejects.toThrow('Cookie password is required');
        });
      });

      describe('when successfully authenticated', () => {
        it('returns the sealed session data', async () => {
          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const response = await workos.userManagement.authenticateWithCode({
            clientId: 'proj_whatever',
            code: 'or this',
            session: { sealSession: true, cookiePassword },
          });

          expect(response).toEqual({
            sealedSession: expect.any(String),
            accessToken: expect.any(String),
            authenticationMethod: undefined,
            impersonator: undefined,
            organizationId: undefined,
            refreshToken: undefined,
            user: expect.objectContaining({
              email: 'test01@example.com',
            }),
          });
        });
      });
    });

    describe('when oauth_tokens is present', () => {
      it('deserializes oauth_tokens', async () => {
        fetchOnce({
          user: userFixture,
          oauth_tokens: {
            access_token: 'access_token',
            refresh_token: 'refresh',
            expires_at: 123,
            scopes: ['read:users'],
          },
        });

        const resp = await workos.userManagement.authenticateWithCode({
          clientId: 'proj_whatever',
          code: 'or this',
        });

        expect(resp).toMatchObject({
          user: {
            email: 'test01@example.com',
          },
          oauthTokens: {
            accessToken: 'access_token',
            refreshToken: 'refresh',
            expiresAt: 123,
            scopes: ['read:users'],
          },
        });
      });
    });
  });

  describe('authenticateWithCodeAndVerifier', () => {
    it('sends a token authentication request with required code_verifier', async () => {
      fetchOnce({ user: userFixture });
      const resp = await workos.userManagement.authenticateWithCodeAndVerifier({
        clientId: 'proj_whatever',
        code: 'auth_code_123',
        codeVerifier: 'required_code_verifier',
      });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(fetchBody()).toEqual({
        client_id: 'proj_whatever',
        code: 'auth_code_123',
        code_verifier: 'required_code_verifier',
        grant_type: 'authorization_code',
      });

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });

    it('sends a token authentication request with invitation token', async () => {
      fetchOnce({ user: userFixture });
      const resp = await workos.userManagement.authenticateWithCodeAndVerifier({
        clientId: 'proj_whatever',
        code: 'auth_code_123',
        codeVerifier: 'required_code_verifier',
        invitationToken: 'invitation_123',
      });

      expect(fetchURL()).toContain('/user_management/authenticate');
      expect(fetchBody()).toEqual({
        client_id: 'proj_whatever',
        code: 'auth_code_123',
        code_verifier: 'required_code_verifier',
        invitation_token: 'invitation_123',
        grant_type: 'authorization_code',
      });

      expect(resp).toMatchObject({
        user: {
          email: 'test01@example.com',
        },
      });
    });

    describe('when sealSession = true', () => {
      beforeEach(() => {
        fetchOnce({
          user: userFixture,
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
      });

      describe('when the cookie password is undefined', () => {
        it('throws an error', async () => {
          await expect(
            workos.userManagement.authenticateWithCodeAndVerifier({
              clientId: 'proj_whatever',
              code: 'auth_code_123',
              codeVerifier: 'required_code_verifier',
              session: { sealSession: true },
            }),
          ).rejects.toThrow('Cookie password is required');
        });
      });

      describe('when successfully authenticated', () => {
        it('returns the sealed session data', async () => {
          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const response =
            await workos.userManagement.authenticateWithCodeAndVerifier({
              clientId: 'proj_whatever',
              code: 'auth_code_123',
              codeVerifier: 'required_code_verifier',
              session: { sealSession: true, cookiePassword },
            });

          expect(response).toEqual({
            sealedSession: expect.any(String),
            accessToken: expect.any(String),
            authenticationMethod: undefined,
            impersonator: undefined,
            organizationId: undefined,
            refreshToken: undefined,
            user: expect.objectContaining({
              email: 'test01@example.com',
            }),
          });
        });
      });
    });
  });

  describe('authenticateWithRefreshToken', () => {
    it('sends a refresh_token authentication request', async () => {
      fetchOnce({
        user: userFixture,
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

    describe('when sealSession = true', () => {
      beforeEach(() => {
        fetchOnce({
          user: userFixture,
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
      });

      describe('when the cookie password is undefined', () => {
        it('throws an error', async () => {
          await expect(
            workos.userManagement.authenticateWithRefreshToken({
              clientId: 'proj_whatever',
              refreshToken: 'refresh_token1',
              session: { sealSession: true },
            }),
          ).rejects.toThrow('Cookie password is required');
        });
      });

      describe('when successfully authenticated', () => {
        it('returns the sealed session data', async () => {
          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const response =
            await workos.userManagement.authenticateWithRefreshToken({
              clientId: 'proj_whatever',
              refreshToken: 'refresh_token1',
              session: { sealSession: true, cookiePassword },
            });

          expect(response).toEqual({
            sealedSession: expect.any(String),
            accessToken: expect.any(String),
            authenticationMethod: undefined,
            impersonator: undefined,
            organizationId: undefined,
            refreshToken: undefined,
            user: expect.objectContaining({
              email: 'test01@example.com',
            }),
          });
        });
      });
    });
  });

  describe('authenticateWithTotp', () => {
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

    describe('when sealSession = true', () => {
      beforeEach(() => {
        fetchOnce({
          user: userFixture,
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
      });

      describe('when the cookie password is undefined', () => {
        it('throws an error', async () => {
          await expect(
            workos.userManagement.authenticateWithTotp({
              clientId: 'proj_whatever',
              code: 'or this',
              authenticationChallengeId:
                'auth_challenge_01H96FETXGTW1QMBSBT2T36PW0',
              pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
              session: { sealSession: true },
            }),
          ).rejects.toThrow('Cookie password is required');
        });
      });

      describe('when successfully authenticated', () => {
        it('returns the sealed session data', async () => {
          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const response = await workos.userManagement.authenticateWithTotp({
            clientId: 'proj_whatever',
            code: 'or this',
            authenticationChallengeId:
              'auth_challenge_01H96FETXGTW1QMBSBT2T36PW0',
            pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
            session: { sealSession: true, cookiePassword },
          });

          expect(response).toEqual({
            sealedSession: expect.any(String),
            accessToken: expect.any(String),
            authenticationMethod: undefined,
            impersonator: undefined,
            organizationId: undefined,
            refreshToken: undefined,
            user: expect.objectContaining({
              email: 'test01@example.com',
            }),
          });
        });
      });
    });
  });

  describe('authenticateWithEmailVerification', () => {
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

    describe('when sealSession = true', () => {
      beforeEach(() => {
        fetchOnce({
          user: userFixture,
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
      });

      describe('when the cookie password is undefined', () => {
        it('throws an error', async () => {
          await expect(
            workos.userManagement.authenticateWithEmailVerification({
              clientId: 'proj_whatever',
              code: 'or this',
              pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
              session: { sealSession: true },
            }),
          ).rejects.toThrow('Cookie password is required');
        });
      });

      describe('when successfully authenticated', () => {
        it('returns the sealed session data', async () => {
          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const response =
            await workos.userManagement.authenticateWithEmailVerification({
              clientId: 'proj_whatever',
              code: 'or this',
              pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
              session: { sealSession: true, cookiePassword },
            });

          expect(response).toEqual({
            sealedSession: expect.any(String),
            accessToken: expect.any(String),
            authenticationMethod: undefined,
            impersonator: undefined,
            organizationId: undefined,
            refreshToken: undefined,
            user: expect.objectContaining({
              email: 'test01@example.com',
            }),
          });
        });
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

    describe('when sealSession = true', () => {
      beforeEach(() => {
        fetchOnce({
          user: userFixture,
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
      });

      describe('when the cookie password is undefined', () => {
        it('throws an error', async () => {
          await expect(
            workos.userManagement.authenticateWithOrganizationSelection({
              clientId: 'proj_whatever',
              pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
              organizationId: 'org_01H5JQDV7R7ATEYZDEG0W5PRYS',
              session: { sealSession: true },
            }),
          ).rejects.toThrow('Cookie password is required');
        });
      });

      describe('when successfully authenticated', () => {
        it('returns the sealed session data', async () => {
          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const response =
            await workos.userManagement.authenticateWithOrganizationSelection({
              clientId: 'proj_whatever',
              pendingAuthenticationToken: 'cTDQJTTkTkkVYxQUlKBIxEsFs',
              organizationId: 'org_01H5JQDV7R7ATEYZDEG0W5PRYS',
              session: { sealSession: true, cookiePassword },
            });

          expect(response).toEqual({
            sealedSession: expect.any(String),
            accessToken: expect.any(String),
            authenticationMethod: undefined,
            impersonator: undefined,
            organizationId: undefined,
            refreshToken: undefined,
            user: expect.objectContaining({
              email: 'test01@example.com',
            }),
          });
        });
      });
    });
  });

  describe('authenticateWithSessionCookie', () => {
    beforeEach(() => {
      // Mock createRemoteJWKSet
      jest
        .spyOn(jose, 'createRemoteJWKSet')
        .mockImplementation(
          (_url: URL, _options?: jose.RemoteJWKSetOptions) => {
            // This function simulates the token verification process
            const verifyFunction = (
              _protectedHeader: jose.JWSHeaderParameters,
              _token: jose.FlattenedJWSInput,
            ): Promise<jose.KeyLike> => {
              return Promise.resolve({
                type: 'public',
              });
            };

            // Return an object that includes the verify function and the additional expected properties
            return {
              __call__: verifyFunction,
              coolingDown: false,
              fresh: false,
              reloading: false,
              reload: jest.fn().mockResolvedValue(undefined),
              jwks: () => undefined,
            } as unknown as ReturnType<typeof jose.createRemoteJWKSet>;
          },
        );
    });

    it('throws an error when the cookie password is undefined', async () => {
      await expect(
        workos.userManagement.authenticateWithSessionCookie({
          sessionData: 'session_cookie',
        }),
      ).rejects.toThrow('Cookie password is required');
    });

    it('returns authenticated = false when the session cookie is empty', async () => {
      await expect(
        workos.userManagement.authenticateWithSessionCookie({
          sessionData: '',
          cookiePassword: 'secret',
        }),
      ).resolves.toEqual({
        authenticated: false,
        reason: 'no_session_cookie_provided',
      });
    });

    it('returns authenticated = false when session cookie is invalid', async () => {
      await expect(
        workos.userManagement.authenticateWithSessionCookie({
          sessionData: 'thisisacookie',
          cookiePassword: 'secret',
        }),
      ).resolves.toEqual({
        authenticated: false,
        reason: 'invalid_session_cookie',
      });
    });

    it('returns authenticated = false when session cookie cannot be unsealed', async () => {
      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const sessionData = await sealData(
        {
          accessToken: 'abc123',
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      await expect(
        workos.userManagement.authenticateWithSessionCookie({
          sessionData,
          cookiePassword: 'secretpasswordwhichisalsolongbutnottherightone',
        }),
      ).resolves.toEqual({
        authenticated: false,
        reason: 'invalid_session_cookie',
      });
    });

    it('returns authenticated = false when the JWT is invalid', async () => {
      jest.spyOn(jose, 'jwtVerify').mockImplementationOnce(() => {
        throw new Error('Invalid JWT');
      });

      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const sessionData = await sealData(
        {
          accessToken: 'abc123',
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      await expect(
        workos.userManagement.authenticateWithSessionCookie({
          sessionData,
          cookiePassword,
        }),
      ).resolves.toEqual({ authenticated: false, reason: 'invalid_jwt' });
    });

    it('returns the JWT claims when provided a valid JWT', async () => {
      jest
        .spyOn(jose, 'jwtVerify')
        .mockResolvedValue({} as jose.JWTVerifyResult & jose.ResolvedKey);

      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const accessToken =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRoZW50aWNhdGVkIjp0cnVlLCJpbXBlcnNvbmF0b3IiOnsiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJlYXNvbiI6InRlc3QifSwic2lkIjoic2Vzc2lvbl8xMjMiLCJvcmdfaWQiOiJvcmdfMTIzIiwicm9sZSI6Im1lbWJlciIsInBlcm1pc3Npb25zIjpbInBvc3RzOmNyZWF0ZSIsInBvc3RzOmRlbGV0ZSJdLCJlbnRpdGxlbWVudHMiOlsiYXVkaXQtbG9ncyJdLCJmZWF0dXJlX2ZsYWdzIjpbImRhcmstbW9kZSIsImJldGEtZmVhdHVyZXMiXSwidXNlciI6eyJvYmplY3QiOiJ1c2VyIiwiaWQiOiJ1c2VyXzAxSDVKUURWN1I3QVRFWVpERUcwVzVQUllTIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn19.YVNjR8S2xGn2jAoLuEcBQNJ1_xY3OzjRE1-BK0zjfQE';

      const sessionData = await sealData(
        {
          accessToken,
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      await expect(
        workos.userManagement.authenticateWithSessionCookie({
          sessionData,
          cookiePassword,
        }),
      ).resolves.toEqual({
        authenticated: true,
        sessionId: 'session_123',
        organizationId: 'org_123',
        role: 'member',
        permissions: ['posts:create', 'posts:delete'],
        entitlements: ['audit-logs'],
        featureFlags: ['dark-mode', 'beta-features'],
        user: expect.objectContaining({
          email: 'test@example.com',
        }),
        accessToken,
      });
    });

    it('returns the JWT claims when provided a valid JWT with multiple roles', async () => {
      jest
        .spyOn(jose, 'jwtVerify')
        .mockResolvedValue({} as jose.JWTVerifyResult & jose.ResolvedKey);

      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const accessToken =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRoZW50aWNhdGVkIjp0cnVlLCJpbXBlcnNvbmF0b3IiOnsiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJlYXNvbiI6InRlc3QifSwic2lkIjoic2Vzc2lvbl8xMjMiLCJvcmdfaWQiOiJvcmdfMTIzIiwicm9sZSI6ImFkbWluIiwicm9sZXMiOlsiYWRtaW4iLCJtZW1iZXIiXSwicGVybWlzc2lvbnMiOlsicG9zdHM6Y3JlYXRlIiwicG9zdHM6ZGVsZXRlIl0sImVudGl0bGVtZW50cyI6WyJhdWRpdC1sb2dzIl0sImZlYXR1cmVfZmxhZ3MiOlsiZGFyay1tb2RlIiwiYmV0YS1mZWF0dXJlcyJdLCJ1c2VyIjp7Im9iamVjdCI6InVzZXIiLCJpZCI6InVzZXJfMDFINUpRRFY3UjdBVEVZWkRFRzBXNVBSWVMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifX0.hsMptIB7PmbF5pxxtgTtCdUyOAhA11ZIAP-JY5zU5fE';

      const sessionData = await sealData(
        {
          accessToken,
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      await expect(
        workos.userManagement.authenticateWithSessionCookie({
          sessionData,
          cookiePassword,
        }),
      ).resolves.toEqual({
        authenticated: true,
        sessionId: 'session_123',
        organizationId: 'org_123',
        role: 'admin',
        roles: ['admin', 'member'],
        permissions: ['posts:create', 'posts:delete'],
        entitlements: ['audit-logs'],
        featureFlags: ['dark-mode', 'beta-features'],
        user: expect.objectContaining({
          email: 'test@example.com',
        }),
        accessToken,
      });
    });
  });

  describe('refreshAndSealSessionData', () => {
    it('throws an error when the cookie password is undefined', async () => {
      await expect(
        workos.userManagement.refreshAndSealSessionData({
          sessionData: 'session_cookie',
        }),
      ).rejects.toThrow('Cookie password is required');
    });

    it('returns authenticated = false when the session cookie is empty', async () => {
      await expect(
        workos.userManagement.refreshAndSealSessionData({
          sessionData: '',
          cookiePassword: 'secret',
        }),
      ).resolves.toEqual({
        authenticated: false,
        reason: 'no_session_cookie_provided',
      });
    });

    it('returns authenticated = false when session cookie is invalid', async () => {
      await expect(
        workos.userManagement.refreshAndSealSessionData({
          sessionData: 'thisisacookie',
          cookiePassword: 'secret',
        }),
      ).resolves.toEqual({
        authenticated: false,
        reason: 'invalid_session_cookie',
      });
    });

    it('returns authenticated = false when session cookie cannot be unsealed', async () => {
      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const sessionData = await sealData(
        {
          accessToken: 'abc123',
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      await expect(
        workos.userManagement.refreshAndSealSessionData({
          sessionData,
          cookiePassword: 'secretpasswordwhichisalsolongbutnottherightone',
        }),
      ).resolves.toEqual({
        authenticated: false,
        reason: 'invalid_session_cookie',
      });
    });

    it('returns the sealed refreshed session cookie when provided a valid existing session cookie', async () => {
      fetchOnce({
        user: userFixture,
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        refresh_token: 'refresh_token',
      });

      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const sessionData = await sealData(
        {
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      await expect(
        workos.userManagement.refreshAndSealSessionData({
          sessionData,
          cookiePassword,
        }),
      ).resolves.toEqual({
        sealedSession: expect.any(String),
        authenticated: true,
      });
    });
  });

  describe('getSessionFromCookie', () => {
    it('throws an error when the cookie password is undefined', async () => {
      await expect(
        workos.userManagement.getSessionFromCookie({
          sessionData: 'session_cookie',
        }),
      ).rejects.toThrow('Cookie password is required');
    });

    it('returns undefined when the session cookie cannot be unsealed', async () => {
      await expect(
        workos.userManagement.getSessionFromCookie({
          sessionData: '',
          cookiePassword: 'secret',
        }),
      ).resolves.toBeUndefined();
    });

    it('returns the unsealed session cookie data when provided a valid session cookie', async () => {
      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const sessionCookieData = {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        refreshToken: 'def456',
        user: {
          object: 'user',
          id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
          email: 'test@example.com',
        },
      };
      const sessionData = await sealData(sessionCookieData, {
        password: cookiePassword,
      });

      await expect(
        workos.userManagement.getSessionFromCookie({
          sessionData,
          cookiePassword,
        }),
      ).resolves.toEqual(sessionCookieData);
    });
  });

  describe('getEmailVerification', () => {
    it('sends a Get EmailVerification request', async () => {
      fetchOnce(emailVerificationFixture);
      const emailVerification =
        await workos.userManagement.getEmailVerification(emailVerificationId);
      expect(fetchURL()).toContain(
        `/user_management/email_verification/${emailVerificationId}`,
      );
      expect(emailVerification).toMatchObject({
        id: 'email_verification_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        email: 'dane@workos.com',
        expiresAt: '2023-07-18T02:07:19.911Z',
        code: '123456',
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
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

  describe('getMagicAuth', () => {
    it('sends a Get Magic Auth request', async () => {
      fetchOnce(magicAuthFixture);
      const magicAuth = await workos.userManagement.getMagicAuth(magicAuthId);
      expect(fetchURL()).toContain(
        `/user_management/magic_auth/${magicAuthId}`,
      );
      expect(magicAuth).toMatchObject({
        id: 'magic_auth_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        email: 'dane@workos.com',
        expiresAt: '2023-07-18T02:07:19.911Z',
        code: '123456',
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });
  });

  describe('createMagicAuth', () => {
    it('sends a Create Magic Auth request', async () => {
      fetchOnce(magicAuthFixture);

      const response = await workos.userManagement.createMagicAuth({
        email: 'bob.loblaw@example.com',
      });

      expect(fetchURL()).toContain('/user_management/magic_auth');
      expect(fetchBody()).toEqual({
        email: 'bob.loblaw@example.com',
      });
      expect(response).toMatchObject({
        id: 'magic_auth_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        email: 'dane@workos.com',
        expiresAt: '2023-07-18T02:07:19.911Z',
        code: '123456',
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
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

  describe('getPasswordReset', () => {
    it('sends a Get PaswordReset request', async () => {
      fetchOnce(passwordResetFixture);
      const passwordReset = await workos.userManagement.getPasswordReset(
        passwordResetId,
      );
      expect(fetchURL()).toContain(
        `/user_management/password_reset/${passwordResetId}`,
      );
      expect(passwordReset).toMatchObject({
        id: 'password_reset_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        email: 'dane@workos.com',
        passwordResetToken: 'Z1uX3RbwcIl5fIGJJJCXXisdI',
        passwordResetUrl:
          'https://your-app.com/reset-password?token=Z1uX3RbwcIl5fIGJJJCXXisdI',
        expiresAt: '2023-07-18T02:07:19.911Z',
        createdAt: '2023-07-18T02:07:19.911Z',
      });
    });
  });

  describe('createMagicAuth', () => {
    it('sends a Create Magic Auth request', async () => {
      fetchOnce(passwordResetFixture);

      const response = await workos.userManagement.createPasswordReset({
        email: 'dane@workos.com',
      });

      expect(fetchURL()).toContain('/user_management/password_reset');
      expect(fetchBody()).toEqual({
        email: 'dane@workos.com',
      });
      expect(response).toMatchObject({
        id: 'password_reset_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        email: 'dane@workos.com',
        passwordResetToken: 'Z1uX3RbwcIl5fIGJJJCXXisdI',
        passwordResetUrl:
          'https://your-app.com/reset-password?token=Z1uX3RbwcIl5fIGJJJCXXisdI',
        expiresAt: '2023-07-18T02:07:19.911Z',
        createdAt: '2023-07-18T02:07:19.911Z',
      });
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

    it('adds metadata to the request', async () => {
      fetchOnce(userFixture);

      await workos.userManagement.updateUser({
        userId,
        metadata: { key: 'value' },
      });

      expect(fetchBody()).toMatchObject({
        metadata: { key: 'value' },
      });
    });

    it('removes metadata from the request', async () => {
      fetchOnce(userFixture);

      await workos.userManagement.updateUser({
        userId,
        metadata: { key: null },
      });

      expect(fetchBody()).toMatchObject({
        metadata: {},
      });
    });

    it('updates user locale', async () => {
      fetchOnce(userFixture);

      const resp = await workos.userManagement.updateUser({
        userId,
        locale: 'en-US',
      });

      expect(fetchURL()).toContain(`/user_management/users/${userId}`);
      expect(fetchBody()).toEqual({
        locale: 'en-US',
      });

      expect(resp).toMatchObject({
        id: userId,
        locale: 'en-US',
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
        totpSecret: 'secret-test',
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

  describe('listSessions', () => {
    it('sends a listSessions request', async () => {
      fetchOnce(listSessionsFixture);

      const resp = await workos.userManagement.listSessions(userId);

      expect(fetchURL()).toContain(`/user_management/users/${userId}/sessions`);

      expect(resp).toMatchObject({
        object: 'list',
        data: [
          {
            object: 'session',
            id: 'session_01K0T5TNC755C7FGRQFJRS4QK5',
            userId: 'user_01K0T5T62NBSETXQD3NVGEA2RN',
            userAgent:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            ipAddress: '192.168.65.1',
            authMethod: 'oauth',
            status: 'active',
            expiresAt: '2026-07-22T22:59:48.743Z',
            endedAt: null,
            createdAt: '2025-07-23T04:59:48.738Z',
            updatedAt: '2025-07-23T04:59:48.738Z',
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

  describe('getUserIdentities', () => {
    it('sends a Get User Identities request', async () => {
      fetchOnce(identityFixture);

      const resp = await workos.userManagement.getUserIdentities(userId);

      expect(fetchURL()).toContain(
        `/user_management/users/${userId}/identities`,
      );
      expect(resp).toMatchObject([
        {
          idpId: '108872335',
          type: 'OAuth',
          provider: 'GithubOAuth',
        },
        {
          idpId: '111966195055680542408',
          type: 'OAuth',
          provider: 'GoogleOAuth',
        },
      ]);
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
            organizationName: 'Example Organization',
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
        statuses: ['active', 'inactive'],
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
      });

      expect(fetchSearchParams()).toEqual({
        user_id: 'user_someuser',
        organization_id: 'org_someorg',
        statuses: 'active,inactive',
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
        role: {
          slug: 'member',
        },
      });
    });
  });

  describe('updateOrganizationMembership', () => {
    it('sends an update organization membership request', async () => {
      fetchOnce(organizationMembershipFixture, {
        status: 200,
      });
      const organizationMembership =
        await workos.userManagement.updateOrganizationMembership(
          organizationMembershipId,
          {
            roleSlug: 'member',
          },
        );

      expect(fetchURL()).toContain(
        `/user_management/organization_memberships/${organizationMembershipId}`,
      );
      expect(organizationMembership).toMatchObject({
        object: 'organization_membership',
        organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        status: 'active',
        role: {
          slug: 'member',
        },
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

  describe('deactivateOrganizationMembership', () => {
    it('sends a deactivateOrganizationMembership request', async () => {
      fetchOnce(deactivateOrganizationMembershipsFixture);

      const organizationMembership =
        await workos.userManagement.deactivateOrganizationMembership(
          organizationMembershipId,
        );

      expect(fetchURL()).toContain(
        `/user_management/organization_memberships/${organizationMembershipId}/deactivate`,
      );
      expect(organizationMembership).toMatchObject({
        object: 'organization_membership',
        organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        status: 'inactive',
        role: {
          slug: 'member',
        },
      });
    });
  });

  describe('reactivateOrganizationMembership', () => {
    it('sends a reactivateOrganizationMembership request', async () => {
      fetchOnce(organizationMembershipFixture);

      const organizationMembership =
        await workos.userManagement.reactivateOrganizationMembership(
          organizationMembershipId,
        );

      expect(fetchURL()).toContain(
        `/user_management/organization_memberships/${organizationMembershipId}/reactivate`,
      );
      expect(organizationMembership).toMatchObject({
        object: 'organization_membership',
        organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        status: 'active',
        role: {
          slug: 'member',
        },
      });
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
      expect(invitation).toMatchObject({
        object: 'invitation',
        id: invitationId,
      });
    });
  });

  describe('findInvitationByToken', () => {
    it('sends a find invitation by token request', async () => {
      fetchOnce(invitationFixture);
      const invitation = await workos.userManagement.findInvitationByToken(
        invitationToken,
      );
      expect(fetchURL()).toContain(
        `/user_management/invitations/by_token/${invitationToken}`,
      );
      expect(invitation).toMatchObject({
        object: 'invitation',
        token: invitationToken,
      });
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

  describe('acceptInvitation', () => {
    it('sends an Accept Invitation request', async () => {
      const invitationId = 'invitation_01H5JQDV7R7ATEYZDEG0W5PRYS';
      fetchOnce({
        ...invitationFixture,
        state: 'accepted',
        accepted_user_id: 'user_01HGK4K4PXNSG85RNNV0GXYP5W',
      });

      const response = await workos.userManagement.acceptInvitation(
        invitationId,
      );

      expect(fetchURL()).toContain(
        `/user_management/invitations/${invitationId}/accept`,
      );
      expect(response).toMatchObject({
        object: 'invitation',
        email: 'dane@workos.com',
        state: 'accepted',
        acceptedUserId: 'user_01HGK4K4PXNSG85RNNV0GXYP5W',
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
    describe('with a screenHint', () => {
      it('generates an authorize url with a screenHint', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          provider: 'authkit',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
          screenHint: 'sign-up',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with a code_challenge and code_challenge_method', () => {
      it('generates an authorize url', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          provider: 'authkit',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
          codeChallenge: 'code_challenge_value',
          codeChallengeMethod: 'S256',
        });

        expect(url).toMatchSnapshot();
      });
    });

    describe('with no custom api hostname', () => {
      it('generates an authorize url with the default api hostname', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          provider: 'GoogleOAuth',
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
          provider: 'GoogleOAuth',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
        });

        expect(url).toMatchSnapshot();
      });

      describe('with providerScopes', () => {
        it('generates an authorize url that includes the specified scopes', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.userManagement.getAuthorizationUrl({
            provider: 'GoogleOAuth',
            providerScopes: [
              'https://www.googleapis.com/auth/calendar',
              'https://www.googleapis.com/auth/admin.directory.group',
            ],
            clientId: 'proj_123',
            redirectUri: 'example.com/auth/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });

        describe('with providerQueryParams', () => {
          it('generates an authorize url that includes the specified query params', () => {
            const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

            const url = workos.userManagement.getAuthorizationUrl({
              provider: 'GoogleOAuth',
              clientId: 'proj_123',
              redirectUri: 'example.com/auth/workos/callback',
              providerQueryParams: {
                foo: 'bar',
                baz: 123,
                bool: true,
              },
            });
            expect(url).toMatchSnapshot();
          });
        });
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

      describe('with providerScopes', () => {
        it('generates an authorize url that includes the specified scopes', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.userManagement.getAuthorizationUrl({
            connectionId: 'connection_123',
            providerScopes: ['read_api', 'read_repository'],
            clientId: 'proj_123',
            redirectUri: 'example.com/auth/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
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

    describe('with prompt', () => {
      it('generates an authorize url with the provided prompt', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          prompt: 'login',
          connectionId: 'connection_123',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
          state: 'custom state',
        });

        expect(url).toMatchInlineSnapshot(
          `"https://api.workos.com/user_management/authorize?client_id=proj_123&connection_id=connection_123&prompt=login&redirect_uri=example.com%2Fauth%2Fworkos%2Fcallback&response_type=code&state=custom+state"`,
        );
      });

      it('generates an authorize url with consent prompt', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getAuthorizationUrl({
          prompt: 'consent',
          provider: 'GoogleOAuth',
          clientId: 'proj_123',
          redirectUri: 'example.com/auth/workos/callback',
        });

        expect(url).toMatchInlineSnapshot(
          `"https://api.workos.com/user_management/authorize?client_id=proj_123&prompt=consent&provider=GoogleOAuth&redirect_uri=example.com%2Fauth%2Fworkos%2Fcallback&response_type=code"`,
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

    describe('when a `returnTo` is given', () => {
      it('includes a `return_to` in the URL', () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const url = workos.userManagement.getLogoutUrl({
          sessionId: '123456',
          returnTo: 'https://your-app.com/signed-out',
        });

        expect(url).toBe(
          'https://api.workos.com/user_management/sessions/logout?session_id=123456&return_to=https%3A%2F%2Fyour-app.com%2Fsigned-out',
        );
      });
    });
  });

  describe('getLogoutUrlFromSessionCookie', () => {
    beforeEach(() => {
      // Mock createRemoteJWKSet
      jest
        .spyOn(jose, 'createRemoteJWKSet')
        .mockImplementation(
          (_url: URL, _options?: jose.RemoteJWKSetOptions) => {
            // This function simulates the token verification process
            const verifyFunction = (
              _protectedHeader: jose.JWSHeaderParameters,
              _token: jose.FlattenedJWSInput,
            ): Promise<jose.KeyLike> => {
              return Promise.resolve({
                type: 'public',
              });
            };

            // Return an object that includes the verify function and the additional expected properties
            return {
              __call__: verifyFunction,
              coolingDown: false,
              fresh: false,
              reloading: false,
              reload: jest.fn().mockResolvedValue(undefined),
              jwks: () => undefined,
            } as unknown as ReturnType<typeof jose.createRemoteJWKSet>;
          },
        );
    });

    it('throws an error when the cookie password is undefined', async () => {
      await expect(
        workos.userManagement.getLogoutUrlFromSessionCookie({
          sessionData: 'session_cookie',
        }),
      ).rejects.toThrow('Cookie password is required');
    });

    it('returns authenticated = false when the session cookie is empty', async () => {
      await expect(
        workos.userManagement.getLogoutUrlFromSessionCookie({
          sessionData: '',
          cookiePassword: 'secret',
        }),
      ).rejects.toThrowError(
        new Error(
          'Failed to extract session ID for logout URL: no_session_cookie_provided',
        ),
      );
    });

    it('returns authenticated = false when session cookie is invalid', async () => {
      await expect(
        workos.userManagement.getLogoutUrlFromSessionCookie({
          sessionData: 'thisisacookie',
          cookiePassword: 'secret',
        }),
      ).rejects.toThrowError(
        new Error(
          'Failed to extract session ID for logout URL: invalid_session_cookie',
        ),
      );
    });

    it('returns authenticated = false when session cookie cannot be unsealed', async () => {
      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const sessionData = await sealData(
        {
          accessToken: 'abc123',
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      await expect(
        workos.userManagement.getLogoutUrlFromSessionCookie({
          sessionData,
          cookiePassword: 'secretpasswordwhichisalsolongbutnottherightone',
        }),
      ).rejects.toThrowError(
        new Error(
          'Failed to extract session ID for logout URL: invalid_session_cookie',
        ),
      );
    });

    it('returns authenticated = false when the JWT is invalid', async () => {
      jest.spyOn(jose, 'jwtVerify').mockImplementationOnce(() => {
        throw new Error('Invalid JWT');
      });

      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const sessionData = await sealData(
        {
          accessToken: 'abc123',
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      await expect(
        workos.userManagement.getLogoutUrlFromSessionCookie({
          sessionData,
          cookiePassword,
        }),
      ).rejects.toThrowError(
        new Error('Failed to extract session ID for logout URL: invalid_jwt'),
      );
    });

    it('returns the logout URL for the session when provided a valid JWT', async () => {
      jest
        .spyOn(jose, 'jwtVerify')
        .mockResolvedValue({} as jose.JWTVerifyResult & jose.ResolvedKey);

      const cookiePassword = 'alongcookiesecretmadefortestingsessions';
      const sessionData = await sealData(
        {
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      await expect(
        workos.userManagement.getLogoutUrlFromSessionCookie({
          sessionData,
          cookiePassword,
        }),
      ).resolves.toEqual(
        `https://api.workos.test/user_management/sessions/logout?session_id=session_123`,
      );
    });
  });

  describe('getJwksUrl', () => {
    it('returns the jwks url', () => {
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      const url = workos.userManagement.getJwksUrl('client_whatever');

      expect(url).toBe('https://api.workos.com/sso/jwks/client_whatever');
    });

    it('throws an error if the clientId is blank', () => {
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      expect(() => {
        workos.userManagement.getJwksUrl('');
      }).toThrowError(TypeError);
    });
  });
});
