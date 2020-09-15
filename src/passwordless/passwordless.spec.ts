import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import { WorkOS } from '../workos';

const mock = new MockAdapater(axios);

describe('Passwordless', () => {
  afterEach(() => mock.resetHistory());

  describe('createSession', () => {
    describe('with valid options', () => {
      it('creates a passwordless session', async () => {
        mock.onPost().reply(200, {});
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const email = 'passwordless-session-email@workos.com';
        await workos.passwordless.createSession({
          type: 'MagicLink',
          email,
        });

        expect(JSON.parse(mock.history.post[0].data).email).toEqual(email);
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

        expect(mock.history.post[0].url).toEqual(`/passwordless/sessions/${sessionId}/send`);
      });
    });
  });
});
