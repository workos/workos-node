import { WorkOS } from '../workos';
import { ChallengeFactorOptions } from './interfaces/challenge-factor-options';
import { Challenge } from './interfaces/challenge.interface';
import { EnrollFactorOptions } from './interfaces/enroll-factor-options';
import { Factor } from './interfaces/factor.interface';
import { VerifyFactorOptions } from './interfaces/verify-factor-options';
import { VerifyResponse } from './interfaces/verify-challenge-response';
import { VerifyChallengeOptions } from './interfaces/verify-challenge-options';

export class Mfa {
  constructor(private readonly workos: WorkOS) {}

  async deleteFactor(id: string) {
    await this.workos.delete(`/auth/factors/${id}`);
  }

  async getFactor(id: string) {
    const { data } = await this.workos.get(`/auth/factors/${id}`);
    return data;
  }

  async enrollFactor(options: EnrollFactorOptions): Promise<Factor> {
    const { data } = await this.workos.post('/auth/factors/enroll', {
      type: options.type,
      ...(() => {
        switch (options.type) {
          case 'sms':
            return {
              phone_number: options.phoneNumber,
            };
          case 'totp':
            return {
              totp_issuer: options.issuer,
              totp_user: options.user,
            };
          default:
            return {};
        }
      })(),
    });

    return data;
  }

  async challengeFactor(options: ChallengeFactorOptions): Promise<Challenge> {
    const { data } = await this.workos.post(
      `/auth/factors/${options.authenticationFactorId}/challenge`,
      {
        sms_template:
          'smsTemplate' in options ? options.smsTemplate : undefined,
      },
    );

    return data;
  }

  /**
   * @deprecated Please use `verifyChallenge` instead.
   */
  async verifyFactor(options: VerifyFactorOptions): Promise<VerifyResponse> {
    return this.verifyChallenge(options);
  }

  async verifyChallenge(
    options: VerifyChallengeOptions,
  ): Promise<VerifyResponse> {
    const { data } = await this.workos.post(
      `/auth/challenges/${options.authenticationChallengeId}/verify`,
      {
        code: options.code,
      },
    );

    return data;
  }
}
