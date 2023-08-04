import { WorkOS } from '../workos';
import {
  ChallengeFactorOptions,
  Challenge,
  EnrollFactorOptions,
  Factor,
  VerifyChallengeOptions,
  VerifyFactorOptions,
  VerifyResponse,
  FactorResponse,
  ChallengeResponse,
  VerifyResponseResponse,
} from './interfaces';
import {
  deserializeChallenge,
  deserializeFactor,
  deserializeVerifyResponse,
} from './serializers';

export class Mfa {
  constructor(private readonly workos: WorkOS) {}

  async deleteFactor(id: string) {
    await this.workos.delete(`/auth/factors/${id}`);
  }

  async getFactor(id: string): Promise<Factor> {
    const { data } = await this.workos.get<FactorResponse>(
      `/auth/factors/${id}`,
    );

    return deserializeFactor(data);
  }

  async enrollFactor(options: EnrollFactorOptions): Promise<Factor> {
    const { data } = await this.workos.post<FactorResponse>(
      '/auth/factors/enroll',
      {
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
      },
    );

    return deserializeFactor(data);
  }

  async challengeFactor(options: ChallengeFactorOptions): Promise<Challenge> {
    const { data } = await this.workos.post<ChallengeResponse>(
      `/auth/factors/${options.authenticationFactorId}/challenge`,
      {
        sms_template:
          'smsTemplate' in options ? options.smsTemplate : undefined,
      },
    );

    return deserializeChallenge(data);
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
    const { data } = await this.workos.post<VerifyResponseResponse>(
      `/auth/challenges/${options.authenticationChallengeId}/verify`,
      {
        code: options.code,
      },
    );

    return deserializeVerifyResponse(data);
  }
}
