import { WorkOS } from '../workos';
import {
  Challenge,
  ChallengeFactorOptions,
  ChallengeResponse,
  EnrollFactorOptions,
  Factor,
  FactorResponse,
  FactorWithSecrets,
  FactorWithSecretsResponse,
  VerifyChallengeOptions,
  VerifyResponse,
  VerifyResponseResponse,
} from './interfaces';
import {
  deserializeChallenge,
  deserializeFactor,
  deserializeFactorWithSecrets,
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

  async enrollFactor(options: EnrollFactorOptions): Promise<FactorWithSecrets> {
    const { data } = await this.workos.post<FactorWithSecretsResponse>(
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

    return deserializeFactorWithSecrets(data);
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
