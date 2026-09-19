import fetch from 'jest-fetch-mock';
import {
  fetchOnce,
  fetchURL,
  fetchBody,
  fetchMethod,
} from '../common/utils/test-utils';

import createSession from './fixtures/create-session.json';
import { WorkOS } from '../workos';

describe('Passwordless', () => {
  beforeEach(() => fetch.resetMocks());

  describe('createSession', () => {
    describe('with valid options', () => {
      it('creates a passwordless session', async () => {
        const email = 'passwordless-session-email@workos.com';
        const redirectURI = 'https://example.com/passwordless/callback';

        fetchOnce(createSession, { status: 201 });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const session = await workos.passwordless.createSession({
          type: 'MagicLink',
          email,
          redirectURI,
        });

        expect(session.email).toEqual(email);
        expect(session.object).toEqual('passwordless_session');

        expect(fetchBody().email).toEqual(email);
        expect(fetchBody().redirect_uri).toEqual(redirectURI);
        expect(fetchURL()).toContain('/passwordless/sessions');
      });
    });
  });

  describe('sendEmail', () => {
    describe('with a valid session id', () => {
      it(`sends a request to send a magic link email`, async () => {
        fetchOnce();
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const sessionId = 'session_123';
        await workos.passwordless.sendSession(sessionId);

        expect(fetchURL()).toContain(
          `/passwordless/sessions/${sessionId}/send`,
        );
      });
    });
  });

  describe('path parameter encoding', () => {
    const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

    it('keeps a traversal payload inside a single path segment', async () => {
      fetchOnce({ success: true });

      await workos.passwordless.sendSession(
        '../../user_management/users/user_01VICTIM',
      );

      expect(fetchMethod()).toBe('POST');
      expect(new URL(String(fetchURL())).pathname).toBe(
        '/passwordless/sessions/..%2F..%2Fuser_management%2Fusers%2Fuser_01VICTIM/send',
      );
    });

    it('rejects a dot-only segment before sending a request', async () => {
      await expect(workos.passwordless.sendSession('..')).rejects.toThrow(
        TypeError,
      );

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
