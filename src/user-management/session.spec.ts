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
        workos.userManagement.loadSealedSession({
          sessionData: 'sessionData',
          cookiePassword: '',
        });
      }).toThrow('cookiePassword is required');
    });

    it('creates a new Session instance', () => {
      const session = workos.userManagement.loadSealedSession({
        sessionData: 'sessionData',
        cookiePassword: 'cookiePassword',
      });

      expect(session).toBeInstanceOf(Session);
    });
  });

  describe('authenticate', () => {
    it('returns a failed response if no sessionData is provided', async () => {
      const session = workos.userManagement.loadSealedSession({
        sessionData: '',
        cookiePassword: 'cookiePassword',
      });
      const response = await session.authenticate();

      expect(response).toEqual({
        authenticated: false,
        reason: 'no_session_cookie_provided',
      });
    });

    it('returns a failed response if no accessToken is found in the sessionData', async () => {
      const session = workos.userManagement.loadSealedSession({
        sessionData: 'sessionData',
        cookiePassword: 'cookiePassword',
      });

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

      const session = workos.userManagement.loadSealedSession({
        sessionData,
        cookiePassword,
      });
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

      const accessToken =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRoZW50aWNhdGVkIjp0cnVlLCJpbXBlcnNvbmF0b3IiOnsiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJlYXNvbiI6InRlc3QifSwic2lkIjoic2Vzc2lvbl8xMjMiLCJvcmdfaWQiOiJvcmdfMTIzIiwicm9sZSI6Im1lbWJlciIsInBlcm1pc3Npb25zIjpbInBvc3RzOmNyZWF0ZSIsInBvc3RzOmRlbGV0ZSJdLCJlbnRpdGxlbWVudHMiOlsiYXVkaXQtbG9ncyJdLCJ1c2VyIjp7Im9iamVjdCI6InVzZXIiLCJpZCI6InVzZXJfMDFINUpRRFY3UjdBVEVZWkRFRzBXNVBSWVMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifX0.A8mDST4wtq_0vId6ALg7k2Ukr7FXrszZtdJ_6dfXeAc';

      const sessionData = await sealData(
        {
          accessToken,
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

      const session = workos.userManagement.loadSealedSession({
        sessionData,
        cookiePassword,
      });

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
        entitlements: ['audit-logs'],
        user: {
          object: 'user',
          id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
          email: 'test@example.com',
        },
        accessToken,
      });
    });
  });

  describe('refresh', () => {
    it('returns a failed response if invalid session data is provided', async () => {
      fetchOnce({ user: userFixture });

      const session = workos.userManagement.loadSealedSession({
        sessionData: '',
        cookiePassword: 'cookiePassword',
      });

      const response = await session.refresh();

      expect(response).toEqual({
        authenticated: false,
        reason: 'invalid_session_cookie',
      });
    });

    describe('when the session data is valid', () => {
      it('returns a successful response with a sealed and unsealed session', async () => {
        const accessToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const refreshToken = 'def456';

        fetchOnce({
          user: userFixture,
          accessToken,
          refreshToken,
        });

        const cookiePassword = 'alongcookiesecretmadefortestingsessions';

        const sessionData = await sealData(
          {
            accessToken,
            refreshToken,
            impersonator: {
              email: 'admin@example.com',
              reason: 'test',
            },
            user: {
              object: 'user',
              id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
              email: 'test01@example.com',
            },
          },
          { password: cookiePassword },
        );

        const session = workos.userManagement.loadSealedSession({
          sessionData,
          cookiePassword,
        });

        const response = await session.refresh();

        expect(response).toEqual({
          authenticated: true,
          impersonator: {
            email: 'admin@example.com',
            reason: 'test',
          },
          organizationId: 'org_123',
          sealedSession: expect.any(String),
          session: expect.objectContaining({
            sealedSession: expect.any(String),
            user: expect.objectContaining({
              email: 'test01@example.com',
            }),
          }),
          entitlements: undefined,
          permissions: ['posts:create', 'posts:delete'],
          role: 'member',
          sessionId: 'session_123',
          user: expect.objectContaining({
            email: 'test01@example.com',
            id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
            object: 'user',
          }),
        });
      });

      it('overwrites the cookie password if a new one is provided', async () => {
        const accessToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const refreshToken = 'def456';

        fetchOnce({
          user: userFixture,
          accessToken,
          refreshToken,
        });

        jest
          .spyOn(jose, 'jwtVerify')
          .mockResolvedValue({} as jose.JWTVerifyResult & jose.ResolvedKey);

        const cookiePassword = 'alongcookiesecretmadefortestingsessions';

        const sessionData = await sealData(
          {
            accessToken,
            refreshToken,
            user: {
              object: 'user',
              id: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
              email: 'test01@example.com',
            },
          },
          { password: cookiePassword },
        );

        const session = workos.userManagement.loadSealedSession({
          sessionData,
          cookiePassword,
        });

        const newCookiePassword =
          'anevenlongercookiesecretmadefortestingsessions';

        const response = await session.refresh({
          cookiePassword: newCookiePassword,
        });

        expect(response.authenticated).toBe(true);

        const resp = await session.authenticate();

        expect(resp.authenticated).toBe(true);
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

      const session = workos.userManagement.loadSealedSession({
        sessionData,
        cookiePassword,
      });

      const url = await session.getLogoutUrl();

      expect(url).toEqual(
        'https://api.workos.com/user_management/sessions/logout?session_id=session_123',
      );
    });

    it('returns an error if the session is invalid', async () => {
      const session = workos.userManagement.loadSealedSession({
        sessionData: '',
        cookiePassword: 'cookiePassword',
      });

      await expect(session.getLogoutUrl()).rejects.toThrow(
        'Failed to extract session ID for logout URL: no_session_cookie_provided',
      );
    });

    describe('when a returnTo URL is provided', () => {
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

        const session = workos.userManagement.loadSealedSession({
          sessionData,
          cookiePassword,
        });

        const url = await session.getLogoutUrl({
          returnTo: 'https://example.com/signed-out',
        });

        expect(url).toBe(
          'https://api.workos.com/user_management/sessions/logout?session_id=session_123&return_to=https%3A%2F%2Fexample.com%2Fsigned-out',
        );
      });
    });
  });
});
