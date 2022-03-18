import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { WorkOS } from '../workos';

describe('MFA', () => {
  describe('getFactor', () => {
    it('throws an error for incomplete arguments', async () => {
      const mock = new MockAdapter(axios);
      mock.onGet().reply(200, {});
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
      const factor = await workos.mfa.getFactor('test_123');

      expect(factor).toMatchInlineSnapshot(`Object {}`);
    });
  });
  describe('deleteFactor', () => {
    it('sends request to delete a Factor', async () => {
      const mock = new MockAdapter(axios);
      mock.onDelete().reply(200, {});
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      await workos.mfa.deleteFactor('conn_123');

      expect(mock.history.delete[0].url).toEqual('/auth/factors/conn_123');
    });
  });
  describe('enrollFactor', () => {
    describe('with generic', () => {
      it('enrolls a factor with generic type', async () => {
        const mock = new MockAdapter(axios);
        mock.onPost('/auth/factors/enroll').reply(200, {
          object: 'authentication_factor',
          id: 'auth_factor_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          type: 'generic_otp',
          environment_id: 'environment_1234',
        });
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const enrollResponse = await workos.mfa.enrollFactor({
          type: 'generic_otp',
        });

        expect(enrollResponse).toMatchInlineSnapshot(`
          Object {
            "created_at": "2022-03-15T20:39:19.892Z",
            "environment_id": "environment_1234",
            "id": "auth_factor_1234",
            "object": "authentication_factor",
            "type": "generic_otp",
            "updated_at": "2022-03-15T20:39:19.892Z",
          }
        `);
      });
    });
    describe('with totp', () => {
      it('enrolls a factor with totp type', async () => {
        const mock = new MockAdapter(axios);
        mock.onPost('/auth/factors/enroll').reply(200, {
          object: 'authentication_factor',
          id: 'auth_factor_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          type: 'totp',
          environment_id: 'environment_1234',
          totp: {
            qr_code: 'qr-code-test',
            secret: 'secret-test',
          },
        });
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const enrollResponse = await workos.mfa.enrollFactor({
          type: 'totp',
          issuer: 'WorkOS',
          user: 'some_user',
        });

        expect(enrollResponse).toMatchInlineSnapshot(`
          Object {
            "created_at": "2022-03-15T20:39:19.892Z",
            "environment_id": "environment_1234",
            "id": "auth_factor_1234",
            "object": "authentication_factor",
            "totp": Object {
              "qr_code": "qr-code-test",
              "secret": "secret-test",
            },
            "type": "totp",
            "updated_at": "2022-03-15T20:39:19.892Z",
          }
        `);
      });
    });
    describe('with sms', () => {
      it('enrolls a factor with sms type', async () => {
        const mock = new MockAdapter(axios);
        mock.onPost('/auth/factors/enroll').reply(200, {
          object: 'authentication_factor',
          id: 'auth_factor_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          type: 'sms',
          environment_id: 'environment_1234',
          sms: {
            phone_number: '+15555555555',
          },
        });
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const enrollResponse = await workos.mfa.enrollFactor({
          type: 'sms',
          phoneNumber: '+1555555555',
        });

        expect(enrollResponse).toMatchInlineSnapshot(`
          Object {
            "created_at": "2022-03-15T20:39:19.892Z",
            "environment_id": "environment_1234",
            "id": "auth_factor_1234",
            "object": "authentication_factor",
            "sms": Object {
              "phone_number": "+15555555555",
            },
            "type": "sms",
            "updated_at": "2022-03-15T20:39:19.892Z",
          }
        `);
      });
    });
  });

  describe('challengeFactor', () => {
    describe('with no sms template', () => {
      it('challenge a factor with no sms template', async () => {
        const mock = new MockAdapter(axios);
        mock.onPost('/auth/factors/challenge').reply(200, {
          object: 'authentication_challenge',
          id: 'auth_challenge_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          expires_at: '2022-03-15T21:39:19.892Z',
          code: '12345',
          authentication_factor_id: 'auth_factor_1234',
        });
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const challengeResponse = await workos.mfa.challengeFactor({
          authentication_factor_id: 'auth_factor_1234',
        });

        expect(challengeResponse).toMatchInlineSnapshot(`
          Object {
            "authentication_factor_id": "auth_factor_1234",
            "code": "12345",
            "created_at": "2022-03-15T20:39:19.892Z",
            "expires_at": "2022-03-15T21:39:19.892Z",
            "id": "auth_challenge_1234",
            "object": "authentication_challenge",
            "updated_at": "2022-03-15T20:39:19.892Z",
          }
        `);
      });
    });
    describe('with totp', () => {
      it('challenge a factor with sms template', async () => {
        const mock = new MockAdapter(axios);
        mock.onPost('/auth/factors/challenge').reply(200, {
          object: 'authentication_challenge',
          id: 'auth_challenge_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          expires_at: '2022-03-15T21:39:19.892Z',
          code: '12345',
          authentication_factor_id: 'auth_factor_1234',
        });
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const challengeResponse = await workos.mfa.challengeFactor({
          authentication_factor_id: 'auth_factor_1234',
          sms_template: 'This is your code: 12345',
        });

        expect(challengeResponse).toMatchInlineSnapshot(`
          Object {
            "authentication_factor_id": "auth_factor_1234",
            "code": "12345",
            "created_at": "2022-03-15T20:39:19.892Z",
            "expires_at": "2022-03-15T21:39:19.892Z",
            "id": "auth_challenge_1234",
            "object": "authentication_challenge",
            "updated_at": "2022-03-15T20:39:19.892Z",
          }
        `);
      });
    });
  });

  describe('verifyFactor', () => {
    describe('verify with successful response', () => {
      it('verifies a successful factor', async () => {
        const mock = new MockAdapter(axios);
        mock.onPost('/auth/factors/verify').reply(200, {
          challenge: {
            object: 'authentication_challenge',
            id: 'auth_challenge_1234',
            created_at: '2022-03-15T20:39:19.892Z',
            updated_at: '2022-03-15T20:39:19.892Z',
            expires_at: '2022-03-15T21:39:19.892Z',
            code: '12345',
            authentication_factor_id: 'auth_factor_1234',
          },
          valid: true,
        });
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const verifyResponse = await workos.mfa.verifyFactor({
          authentication_challenge_id: 'auth_challenge_1234',
          code: '12345',
        });
        expect(verifyResponse).toMatchInlineSnapshot(`
          Object {
            "challenge": Object {
              "authentication_factor_id": "auth_factor_1234",
              "code": "12345",
              "created_at": "2022-03-15T20:39:19.892Z",
              "expires_at": "2022-03-15T21:39:19.892Z",
              "id": "auth_challenge_1234",
              "object": "authentication_challenge",
              "updated_at": "2022-03-15T20:39:19.892Z",
            },
            "valid": true,
          }
        `);
      });
    });
  });
});
