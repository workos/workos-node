import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { UnprocessableEntityException } from '../common/exceptions';

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

      describe('when phone number is invalid', () => {
        it('throws an exception', async () => {
          const mock = new MockAdapter(axios);

          mock.onPost('/auth/factors/enroll').reply(
            422,
            {
              message: `Phone number is invalid: 'foo'`,
              code: 'invalid_phone_number',
            },
            {
              'X-Request-ID': 'req_123',
            },
          );

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          await expect(
            workos.mfa.enrollFactor({
              type: 'sms',
              phoneNumber: 'foo',
            }),
          ).rejects.toThrow(UnprocessableEntityException);
        });
      });
    });
  });

  describe('challengeFactor', () => {
    describe('with no sms template', () => {
      it('challenge a factor with no sms template', async () => {
        const mock = new MockAdapter(axios);
        mock
          .onPost('/auth/factors/challenge', {
            authentication_factor_id: 'auth_factor_1234',
          })
          .reply(200, {
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
          authenticationFactorId: 'auth_factor_1234',
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

    describe('with sms template', () => {
      it('challenge a factor with sms template', async () => {
        const mock = new MockAdapter(axios);
        mock
          .onPost('/auth/factors/challenge', {
            authentication_factor_id: 'auth_factor_1234',
            sms_template: 'This is your code: 12345',
          })
          .reply(200, {
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
          authenticationFactorId: 'auth_factor_1234',
          smsTemplate: 'This is your code: 12345',
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
        mock
          .onPost('/auth/factors/verify', {
            authentication_challenge_id: 'auth_challenge_1234',
            code: '12345',
          })
          .reply(200, {
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
          authenticationChallengeId: 'auth_challenge_1234',
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

    describe('when the challenge has been previously verified', () => {
      it('throws an exception', async () => {
        const mock = new MockAdapter(axios);
        mock
          .onPost('/auth/factors/verify', {
            authentication_challenge_id: 'auth_challenge_1234',
            code: '12345',
          })
          .reply(
            422,
            {
              message: `The authentication challenge '12345' has already been verified.`,
              code: 'authentication_challenge_previously_verified',
            },
            {
              'X-Request-ID': 'req_123',
            },
          );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        await expect(
          workos.mfa.verifyFactor({
            authenticationChallengeId: 'auth_challenge_1234',
            code: '12345',
          }),
        ).rejects.toThrow(UnprocessableEntityException);
      });
    });

    describe('when the challenge has expired', () => {
      it('throws an exception', async () => {
        const mock = new MockAdapter(axios);
        mock
          .onPost('/auth/factors/verify', {
            authentication_challenge_id: 'auth_challenge_1234',
            code: '12345',
          })
          .reply(
            422,
            {
              message: `The authentication challenge '12345' has expired.`,
              code: 'authentication_challenge_expired',
            },
            {
              'X-Request-ID': 'req_123',
            },
          );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        await expect(
          workos.mfa.verifyFactor({
            authenticationChallengeId: 'auth_challenge_1234',
            code: '12345',
          }),
        ).rejects.toThrow(UnprocessableEntityException);
      });

      it('exception has code', async () => {
        const mock = new MockAdapter(axios);
        mock
          .onPost('/auth/factors/verify', {
            authentication_challenge_id: 'auth_challenge_1234',
            code: '12345',
          })
          .reply(
            422,
            {
              message: `The authentication challenge '12345' has expired.`,
              code: 'authentication_challenge_expired',
            },
            {
              'X-Request-ID': 'req_123',
            },
          );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        try {
          await workos.mfa.verifyFactor({
            authenticationChallengeId: 'auth_challenge_1234',
            code: '12345',
          });
        } catch (error) {
          expect(error).toMatchObject({
            code: 'authentication_challenge_expired',
          });
        }
      });
    });
  });
});
