import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { WorkOS } from '../workos';

describe('MFA', () => {
    describe('getFactor', () => {
        it('throws an error for incomplete arguments', () => {
            const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
            const factor = () =>
                workos.mfa.getFactor('test_123');
            expect(factor).toMatchSnapshot
        })
    });
    describe('deleteFactor', () => {
        it('sends request to delete a Factor', async () => {
          const mock = new MockAdapter(axios);
          mock.onDelete().reply(200, {});
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          await workos.mfa.deleteFactor('conn_123');

          expect(mock.history.delete[0].url).toEqual('/factors/conn_123');
        });
    });
    describe('enrollFactor', () => {
        describe('with generic', () => {
            it('enrolls a factor with generic type', () => {
                const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
                    apiHostname: 'api.workos.dev',
                });

                const enrollResponse = workos.mfa.enrollFactor({
                    type: 'generic_otp'
                });

                expect(enrollResponse).toMatchSnapshot();
            });
        });
        describe('with totp', () => {
            it('enrolls a factor with totp type', () => {
                const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
                    apiHostname: 'api.workos.dev',
                });

                const enrollResponse = workos.mfa.enrollFactor({
                    type: 'totp',
                    issuer: 'WorkOS',
                    user: 'some_user',
                });

                expect(enrollResponse).toMatchSnapshot();
            });
        });
        describe('with sms', () => {
            it('enrolls a factor with sms type', () => {
                const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
                    apiHostname: 'api.workos.dev',
                });

                const enrollResponse = workos.mfa.enrollFactor({
                    type: 'sms',
                    phoneNumber: '+1555555555',
                });

                expect(enrollResponse).toMatchSnapshot();
            });
        });
    });

    describe('challengeFactor', () => {
        describe('with no sms template', () => {
            it('enrolls a factor', () => {
                const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
                    apiHostname: 'api.workos.dev',
                });

                const challengeResponse = workos.mfa.challengeFactor({
                    authentication_factor_id: 'test_123456'
                });

                expect(challengeResponse).toMatchSnapshot();
            });
        });
        describe('with totp', () => {
            it('challenge a factor with sms template', () => {
                const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
                    apiHostname: 'api.workos.dev',
                });

                const challengeResponse = workos.mfa.challengeFactor({
                    authentication_factor_id: 'test_123456',
                    sms_template: 'This is your code: 12345'
                });

                expect(challengeResponse).toMatchSnapshot();
            });
        });
    });

    describe('verifyFactor', () => {
        it('verifies a factor', () => {
            const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
                apiHostname: 'api.workos.dev',
            });

            const verifyResponse = workos.mfa.verifyFactor({
                authentication_challenge_id: 'test_123456',
                code:'12345'
            });

            expect(verifyResponse).toMatchSnapshot();
        });
    });
});