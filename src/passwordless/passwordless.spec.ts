import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import createSession from './fixtures/create-session.json';
import { WorkOS } from '../workos';

const mock = new MockAdapter(axios);

describe('Passwordless', () => {
  afterEach(() => mock.resetHistory());

  describe('createSession', () => {
    describe('with valid options', () => {
      it('creates a passwordless session', async () => {
        mock.onPost().reply(201, createSession);
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const email = 'passwordless-session-email@workos.com';
        const redirectURI = 'https://example.com/passwordless/callback';
        const session = await workos.passwordless.createSession({
          type: 'MagicLink',
          email,
          redirectURI,
        });

        expect(session.email).toEqual(email);
        expect(session.object).toEqual('passwordless_session');

        expect(JSON.parse(mock.history.post[0].data).email).toEqual(email);
        expect(JSON.parse(mock.history.post[0].data).redirect_uri).toEqual(
          redirectURI,
        );
        expect(mock.history.post[0].url).toEqual('/passwordless/sessions');
      });
    });
  });

  describe('sendEmail', () => {
    describe('with a valid session id', () => {
      it(`sends a request to send a magic link email`, async () => {
        mock.onPost().reply(200);
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const sessionId = 'session_123';
        await workos.passwordless.sendSession(sessionId);

        expect(mock.history.post[0].url).toEqual(
          `/passwordless/sessions/${sessionId}/send`,
        );
      });
    });
  });
});
