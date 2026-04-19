import { PaginationOptions } from '../common/interfaces/pagination-options.interface';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { AutoPaginatable } from '../common/utils/pagination';
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
import {
  EnrollAuthFactorOptions,
  ListAuthFactorsOptions,
} from '../user-management/interfaces';
import {
  FactorWithSecrets as UMFactorWithSecrets,
  FactorWithSecretsResponse as UMFactorWithSecretsResponse,
  Factor as UMFactor,
  FactorResponse as UMFactorResponse,
} from '../user-management/interfaces/factor.interface';
import { serializeEnrollAuthFactorOptions } from '../user-management/serializers';
import { deserializeFactorWithSecrets as deserializeUMFactorWithSecrets } from '../user-management/serializers/factor.serializer';
import { deserializeFactor as deserializeUMFactor } from '../user-management/serializers/factor.serializer';

export class MultiFactorAuth {
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

  async createUserAuthFactor(payload: EnrollAuthFactorOptions): Promise<{
    authenticationFactor: UMFactorWithSecrets;
    authenticationChallenge: Challenge;
  }> {
    const { data } = await this.workos.post<{
      authentication_factor: UMFactorWithSecretsResponse;
      authentication_challenge: ChallengeResponse;
    }>(
      `/user_management/users/${payload.userId}/auth_factors`,
      serializeEnrollAuthFactorOptions(payload),
    );

    return {
      authenticationFactor: deserializeUMFactorWithSecrets(
        data.authentication_factor,
      ),
      authenticationChallenge: deserializeChallenge(
        data.authentication_challenge,
      ),
    };
  }

  async listUserAuthFactors(
    options: ListAuthFactorsOptions,
  ): Promise<AutoPaginatable<UMFactor, PaginationOptions>> {
    const { userId, ...restOfOptions } = options;
    return new AutoPaginatable(
      await fetchAndDeserialize<UMFactorResponse, UMFactor>(
        this.workos,
        `/user_management/users/${userId}/auth_factors`,
        deserializeUMFactor,
        restOfOptions,
      ),
      (params) =>
        fetchAndDeserialize<UMFactorResponse, UMFactor>(
          this.workos,
          `/user_management/users/${userId}/auth_factors`,
          deserializeUMFactor,
          params,
        ),
      restOfOptions,
    );
  }
}
