import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL, fetchBody } from '../common/utils/test-utils';
import { UnprocessableEntityException } from '../common/exceptions';

import { WorkOS } from '../workos';
import {
  Challenge,
  ChallengeResponse,
  Factor,
  FactorResponse,
  FactorWithSecrets,
  FactorWithSecretsResponse,
  VerifyResponse,
  VerifyResponseResponse,
} from './interfaces';

describe('MFA', () => {
  beforeEach(() => fetch.resetMocks());

  describe('getFactor', () => {
    it('returns the requested factor', async () => {
      const factor: Factor = {
        object: 'authentication_factor',
        id: 'auth_factor_1234',
        createdAt: '2022-03-15T20:39:19.892Z',
        updatedAt: '2022-03-15T20:39:19.892Z',
        type: 'totp',
        totp: {
          issuer: 'WorkOS',
          user: 'some_user',
        },
      };

      const factorResponse: FactorResponse = {
        object: 'authentication_factor',
        id: 'auth_factor_1234',
        created_at: '2022-03-15T20:39:19.892Z',
        updated_at: '2022-03-15T20:39:19.892Z',
        type: 'totp',
        totp: {
          issuer: 'WorkOS',
          user: 'some_user',
        },
      };

      fetchOnce(factorResponse);

      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
      const subject = await workos.mfa.getFactor('test_123');

      expect(subject).toEqual(factor);
    });
  });

  describe('deleteFactor', () => {
    it('sends request to delete a Factor', async () => {
      fetchOnce();
      const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

      await workos.mfa.deleteFactor('conn_123');

      expect(fetchURL()).toContain('/auth/factors/conn_123');
    });
  });

  describe('enrollFactor', () => {
    describe('with generic', () => {
      it('enrolls a factor with generic type', async () => {
        const factor: Factor = {
          object: 'authentication_factor',
          id: 'auth_factor_1234',
          createdAt: '2022-03-15T20:39:19.892Z',
          updatedAt: '2022-03-15T20:39:19.892Z',
          type: 'generic_otp',
        };

        const factorResponse: FactorResponse = {
          object: 'authentication_factor',
          id: 'auth_factor_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          type: 'generic_otp',
        };

        fetchOnce(factorResponse);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const subject = await workos.mfa.enrollFactor({
          type: 'generic_otp',
        });

        expect(subject).toEqual(factor);
      });
    });

    describe('with totp', () => {
      it('enrolls a factor with totp type', async () => {
        const factor: FactorWithSecrets = {
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
        };

        const factorResponse: FactorWithSecretsResponse = {
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
        };

        fetchOnce(factorResponse);
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const subject = await workos.mfa.enrollFactor({
          type: 'totp',
          issuer: 'WorkOS',
          user: 'some_user',
        });

        expect(subject).toEqual(factor);
      });
    });

    describe('with sms', () => {
      it('enrolls a factor with sms type', async () => {
        const factor: Factor = {
          object: 'authentication_factor',
          id: 'auth_factor_1234',
          createdAt: '2022-03-15T20:39:19.892Z',
          updatedAt: '2022-03-15T20:39:19.892Z',
          type: 'sms',
          sms: {
            phoneNumber: '+15555555555',
          },
        };

        const factorResponse: FactorResponse = {
          object: 'authentication_factor',
          id: 'auth_factor_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          type: 'sms',
          sms: {
            phone_number: '+15555555555',
          },
        };

        fetchOnce(factorResponse);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const subject = await workos.mfa.enrollFactor({
          type: 'sms',
          phoneNumber: '+1555555555',
        });

        expect(subject).toEqual(factor);
      });

      describe('when phone number is invalid', () => {
        it('throws an exception', async () => {
          fetchOnce(
            {
              message: `Phone number is invalid: 'foo'`,
              code: 'invalid_phone_number',
            },
            {
              status: 422,
              headers: { 'X-Request-ID': 'req_123' },
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
        const challenge: Challenge = {
          object: 'authentication_challenge',
          id: 'auth_challenge_1234',
          createdAt: '2022-03-15T20:39:19.892Z',
          updatedAt: '2022-03-15T20:39:19.892Z',
          expiresAt: '2022-03-15T21:39:19.892Z',
          code: '12345',
          authenticationFactorId: 'auth_factor_1234',
        };

        const challengeResponse: ChallengeResponse = {
          object: 'authentication_challenge',
          id: 'auth_challenge_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          expires_at: '2022-03-15T21:39:19.892Z',
          code: '12345',
          authentication_factor_id: 'auth_factor_1234',
        };

        fetchOnce(challengeResponse);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const subject = await workos.mfa.challengeFactor({
          authenticationFactorId: 'auth_factor_1234',
        });

        expect(subject).toEqual(challenge);
      });
    });

    describe('with sms template', () => {
      it('challenge a factor with sms template', async () => {
        const challenge: Challenge = {
          object: 'authentication_challenge',
          id: 'auth_challenge_1234',
          createdAt: '2022-03-15T20:39:19.892Z',
          updatedAt: '2022-03-15T20:39:19.892Z',
          expiresAt: '2022-03-15T21:39:19.892Z',
          code: '12345',
          authenticationFactorId: 'auth_factor_1234',
        };

        const challengeResponse: ChallengeResponse = {
          object: 'authentication_challenge',
          id: 'auth_challenge_1234',
          created_at: '2022-03-15T20:39:19.892Z',
          updated_at: '2022-03-15T20:39:19.892Z',
          expires_at: '2022-03-15T21:39:19.892Z',
          code: '12345',
          authentication_factor_id: 'auth_factor_1234',
        };

        fetchOnce(challengeResponse);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const subject = await workos.mfa.challengeFactor({
          authenticationFactorId: 'auth_factor_1234',
          smsTemplate: 'This is your code: 12345',
        });

        expect(fetchBody()).toEqual({
          sms_template: 'This is your code: 12345',
        });
        expect(subject).toEqual(challenge);
      });
    });
  });

  describe('verifyChallenge', () => {
    describe('verify with successful response', () => {
      it('verifies a successful factor', async () => {
        const verifyResponse: VerifyResponse = {
          challenge: {
            object: 'authentication_challenge',
            id: 'auth_challenge_1234',
            createdAt: '2022-03-15T20:39:19.892Z',
            updatedAt: '2022-03-15T20:39:19.892Z',
            expiresAt: '2022-03-15T21:39:19.892Z',
            code: '12345',
            authenticationFactorId: 'auth_factor_1234',
          },
          valid: true,
        };

        const verifyResponseResponse: VerifyResponseResponse = {
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
        };

        fetchOnce(verifyResponseResponse);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        const subject = await workos.mfa.verifyChallenge({
          authenticationChallengeId: 'auth_challenge_1234',
          code: '12345',
        });

        expect(fetchBody()).toEqual({
          code: '12345',
        });
        expect(subject).toEqual(verifyResponse);
      });
    });

    describe('when the challenge has been previously verified', () => {
      it('throws an exception', async () => {
        fetchOnce(
          {
            message: `The authentication challenge '12345' has already been verified.`,
            code: 'authentication_challenge_previously_verified',
          },
          {
            status: 422,
            headers: { 'X-Request-ID': 'req_123' },
          },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        await expect(
          workos.mfa.verifyChallenge({
            authenticationChallengeId: 'auth_challenge_1234',
            code: '12345',
          }),
        ).rejects.toThrow(UnprocessableEntityException);
        expect(fetchBody()).toEqual({
          code: '12345',
        });
      });
    });

    describe('when the challenge has expired', () => {
      it('throws an exception', async () => {
        fetchOnce(
          {
            message: `The authentication challenge '12345' has expired.`,
            code: 'authentication_challenge_expired',
          },
          {
            status: 422,
            headers: { 'X-Request-ID': 'req_123' },
          },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        await expect(
          workos.mfa.verifyChallenge({
            authenticationChallengeId: 'auth_challenge_1234',
            code: '12345',
          }),
        ).rejects.toThrow(UnprocessableEntityException);
        expect(fetchBody()).toEqual({
          code: '12345',
        });
      });

      it('exception has code', async () => {
        fetchOnce(
          {
            message: `The authentication challenge '12345' has expired.`,
            code: 'authentication_challenge_expired',
          },
          {
            status: 422,
            headers: { 'X-Request-ID': 'req_123' },
          },
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
          apiHostname: 'api.workos.dev',
        });

        try {
          await workos.mfa.verifyChallenge({
            authenticationChallengeId: 'auth_challenge_1234',
            code: '12345',
          });
        } catch (error) {
          expect(error).toMatchObject({
            code: 'authentication_challenge_expired',
          });
        }
        expect(fetchBody()).toEqual({
          code: '12345',
        });
      });
    });
  });
});
