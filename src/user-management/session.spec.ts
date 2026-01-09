import { WorkOS } from '../workos';
import { CookieSession } from './session';
import * as jose from 'jose';
import { sealData } from '../common/crypto/seal';
import userFixture from './fixtures/user.json';
import fetch from 'jest-fetch-mock';
import { fetchOnce } from '../common/utils/test-utils';

jest.mock('jose', () => ({
  ...jest.requireActual('jose'),
  jwtVerify: jest.fn(),
}));

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

      expect(session).toBeInstanceOf(CookieSession);
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
      jest.mocked(jose.jwtVerify).mockImplementation(() => {
        // Simulate a jose JWT validation error with the expected code property
        const error = new Error('Invalid JWT');
        (error as Error & { code: string }).code = 'ERR_JWT_INVALID';
        throw error;
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
        .mocked(jose.jwtVerify)
        .mockResolvedValue({} as jose.JWTVerifyResult & jose.ResolvedKey);

      const cookiePassword = 'alongcookiesecretmadefortestingsessions';

      const accessToken =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRoZW50aWNhdGVkIjp0cnVlLCJpbXBlcnNvbmF0b3IiOnsiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJlYXNvbiI6InRlc3QifSwic2lkIjoic2Vzc2lvbl8xMjMiLCJvcmdfaWQiOiJvcmdfMTIzIiwicm9sZSI6Im1lbWJlciIsInJvbGVzIjpbIm1lbWJlciIsImFkbWluIl0sInBlcm1pc3Npb25zIjpbInBvc3RzOmNyZWF0ZSIsInBvc3RzOmRlbGV0ZSJdLCJlbnRpdGxlbWVudHMiOlsiYXVkaXQtbG9ncyJdLCJmZWF0dXJlX2ZsYWdzIjpbImRhcmstbW9kZSIsImJldGEtZmVhdHVyZXMiXSwidXNlciI6eyJvYmplY3QiOiJ1c2VyIiwiaWQiOiJ1c2VyXzAxSDVKUURWN1I3QVRFWVpERUcwVzVQUllTIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn19.TNUzJYn6lzLWFFsiWiKEgIshyUs-bKJQf1VxwNr1cGI';

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
        roles: ['member', 'admin'],
        permissions: ['posts:create', 'posts:delete'],
        entitlements: ['audit-logs'],
        featureFlags: ['dark-mode', 'beta-features'],
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
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJzaWQiOiJzZXNzaW9uXzEyMyIsIm9yZ19pZCI6Im9yZ18xMjMiLCJyb2xlIjoibWVtYmVyIiwicm9sZXMiOlsibWVtYmVyIiwiYWRtaW4iXSwicGVybWlzc2lvbnMiOlsicG9zdHM6Y3JlYXRlIiwicG9zdHM6ZGVsZXRlIl19.N5zveP149QhRR5zNvzGJPiCX098uXaN8VM1_lwsMg4A';
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
          roles: ['member', 'admin'],
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
          .mocked(jose.jwtVerify)
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

      it('rotates refresh tokens when refreshing session', async () => {
        const originalRefreshToken = 'original_refresh_token_123';
        const newRefreshToken = 'new_refresh_token_456';
        const accessToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJzdWIiOiAiMTIzNDU2Nzg5MCIsCiAgIm5hbWUiOiAiSm9obiBEb2UiLAogICJpYXQiOiAxNTE2MjM5MDIyLAogICJzaWQiOiAic2Vzc2lvbl8xMjMiLAogICJvcmdfaWQiOiAib3JnXzEyMyIsCiAgInJvbGUiOiAibWVtYmVyIiwKICAicGVybWlzc2lvbnMiOiBbInBvc3RzOmNyZWF0ZSIsICJwb3N0czpkZWxldGUiXQp9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        // Mock the API to return a new refresh token
        fetchOnce({
          user: userFixture,
          accessToken,
          refreshToken: newRefreshToken, // Different from original
        });

        const cookiePassword = 'alongcookiesecretmadefortestingsessions';

        // Create initial session with original refresh token
        const sessionData = await sealData(
          {
            accessToken,
            refreshToken: originalRefreshToken,
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

        expect(response.authenticated).toBe(true);

        if (!response.authenticated) {
          throw new Error('Expected successful response');
        }

        // Verify we got a new sealed session (which proves the refresh token was rotated)
        expect(response.sealedSession).toBeDefined();
        expect(response.sealedSession).not.toBe(sessionData);
      });
    });
  });

  describe('getLogoutUrl', () => {
    it('returns a logout URL for the user', async () => {
      jest
        .mocked(jose.jwtVerify)
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
          .mocked(jose.jwtVerify)
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
