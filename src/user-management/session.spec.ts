import { WorkOS } from '../workos';
import { Session } from './session';
import * as jose from 'jose';
import { sealData } from 'iron-session';
import userFixture from './fixtures/user.json';
import fetch from 'jest-fetch-mock';
import { fetchOnce } from '../common/utils/test-utils';

describe('Session', () => {
  let workos: WorkOS;

  beforeAll(() => {
    workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
      clientId: 'client_123',
    });
  });

  beforeEach(() => fetch.resetMocks());

  describe('constructor', () => {
    it('throws an error if cookiePassword is not provided', () => {
      expect(() => {
        workos.userManagement.session('sessionData', '');
      }).toThrow('cookiePassword is required');
    });

    it('creates a new Session instance', () => {
      const session = workos.userManagement.session(
        'sessionData',
        'cookiePassword',
      );

      expect(session).toBeInstanceOf(Session);
    });
  });

  describe('authenticate', () => {
    it('returns a failed response if no sessionData is provided', async () => {
      const session = workos.userManagement.session('', 'cookiePassword');
      const response = await session.authenticate();

      expect(response).toEqual({
        authenticated: false,
        reason: 'no_session_cookie_provided',
      });
    });

    it('returns a failed response if no accessToken is found in the sessionData', async () => {
      const session = workos.userManagement.session(
        'sessionData',
        'cookiePassword',
      );
      const response = await session.authenticate();

      expect(response).toEqual({
        authenticated: false,
        reason: 'invalid_session_cookie',
      });
    });

    it('returns a failed response if the accessToken is not a valid JWT', async () => {
      jest.spyOn(jose, 'jwtVerify').mockImplementation(() => {
        throw new Error('Invalid JWT');
      });

      const cookiePassword = 'alongcookiesecretmadefortestingsessions';

      const sessionData = await sealData(
        {
          accessToken:
            'ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9',
          refreshToken: 'def456',
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      const session = workos.userManagement.session(
        sessionData,
        cookiePassword,
      );
      const response = await session.authenticate();

      expect(response).toEqual({
        authenticated: false,
        reason: 'invalid_jwt',
      });
    });

    it('returns a successful response if the sessionData is valid', async () => {
      jest
        .spyOn(jose, 'jwtVerify')
        .mockResolvedValue({} as jose.JWTVerifyResult & jose.ResolvedKey);

      const cookiePassword = 'alongcookiesecretmadefortestingsessions';

      const sessionData = await sealData(
        {
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          refreshToken: 'def456',
          impersonator: {
            email: 'admin@example.com',
            reason: 'test',
          },
          user: {
            object: 'user',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            email: 'test@example.com',
          },
        },
        { password: cookiePassword },
      );

      const session = workos.userManagement.session(
        sessionData,
        cookiePassword,
      );

      await expect(session.authenticate()).resolves.toEqual({
        authenticated: true,
        impersonator: {
          email: 'admin@example.com',
          reason: 'test',
        },
        sessionId: 'session_123',
        organizationId: 'org_123',
        role: 'member',
        permissions: ['posts:create', 'posts:delete'],
        user: {
          object: 'user',
          id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
          email: 'test@example.com',
        },
      });
    });
  });

  describe('refresh', () => {
    it('throws an error if no sealed option is provided without a cookiePassword', async () => {
      const session = workos.userManagement.session(
        'sessionData',
        'cookiePassword',
      );

      await expect(
        session.refresh({ sealed: true, cookiePassword: '' }),
      ).rejects.toThrow('Cookie password is required for sealed sessions');
    });

    it('returns a failed response if invalid session data is provided', async () => {
      fetchOnce({ user: userFixture });

      const session = workos.userManagement.session('', 'cookiePassword');

      const response = await session.refresh({
        sealed: true,
        cookiePassword: 'cookiePassword',
      });

      expect(response).toEqual({
        authenticated: false,
        reason: 'invalid_session_cookie',
      });
    });

    describe('when the session data is valid', () => {
      describe('and sealed = true', () => {
        it('returns a successful response with a sealed session', async () => {
          fetchOnce({ user: userFixture });

          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const sessionData = await sealData(
            {
              accessToken:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
              refreshToken: 'def456',
              impersonator: {
                email: 'admin@example.com',
                reason: 'test',
              },
              user: {
                object: 'user',
                id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
                email: 'test@example.com',
              },
            },
            { password: cookiePassword },
          );

          const session = workos.userManagement.session(
            sessionData,
            cookiePassword,
          );

          const response = await session.refresh({
            sealed: true,
            cookiePassword,
          });

          expect(response).toEqual({
            authenticated: true,
            session: expect.any(String),
          });
        });
      });

      describe('and sealed = false', () => {
        it('returns a successful response with an unsealed session', async () => {
          fetchOnce({ user: userFixture });

          const cookiePassword = 'alongcookiesecretmadefortestingsessions';

          const sessionData = await sealData(
            {
              accessToken:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
              refreshToken: 'def456',
              user: {
                object: 'user',
                id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
                email: 'test01@example.com',
              },
            },
            { password: cookiePassword },
          );

          const session = workos.userManagement.session(
            sessionData,
            cookiePassword,
          );

          const response = await session.refresh({
            sealed: false,
            cookiePassword,
          });

          expect(response).toEqual({
            authenticated: true,
            session: expect.objectContaining({
              sealedSession: expect.any(String),
              user: expect.objectContaining({
                email: 'test01@example.com',
              }),
            }),
          });
        });
      });
    });
  });

  describe('getLogoutUrl', () => {
    it('returns a logout URL for the user', async () => {
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
            email: 'test01@example.com',
          },
        },
        { password: cookiePassword },
      );

      const session = workos.userManagement.session(
        sessionData,
        cookiePassword,
      );

      const url = await session.getLogoutUrl();

      expect(url).toEqual(
        'https://api.workos.com/user_management/sessions/logout?session_id=session_123',
      );
    });

    it('returns an error if the session is invalid', async () => {
      const session = workos.userManagement.session('', 'cookiePassword');

      await expect(session.getLogoutUrl()).rejects.toThrow(
        'Failed to extract session ID for logout URL: no_session_cookie_provided',
      );
    });
  });
});
