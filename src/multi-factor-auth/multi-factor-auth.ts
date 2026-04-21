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

  /**
   * Delete Factor
   *
   * Permanently deletes an Authentication Factor. It cannot be undone.
   * @param id - The unique ID of the Factor.
   * @example "auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ"
   * @returns {Promise<void>}
   * @throws {NotFoundException} 404
   */
  async deleteFactor(id: string) {
    await this.workos.delete(`/auth/factors/${id}`);
  }

  /**
   * Get Factor
   *
   * Gets an Authentication Factor.
   * @param id - The unique ID of the Factor.
   * @example "auth_factor_01FVYZ5QM8N98T9ME5BCB2BBMJ"
   * @returns {Promise<AuthenticationFactor>}
   * @throws {NotFoundException} 404
   */
  async getFactor(id: string): Promise<Factor> {
    const { data } = await this.workos.get<FactorResponse>(
      `/auth/factors/${id}`,
    );

    return deserializeFactor(data);
  }

  /**
   * Enroll Factor
   *
   * Enrolls an Authentication Factor to be used as an additional factor of authentication. The returned ID should be used to create an authentication Challenge.
   * @param options - Object containing type.
   * @returns {Promise<AuthenticationFactorEnrolled>}
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * Challenge Factor
   *
   * Creates a Challenge for an Authentication Factor.
   * @param options - The request body.
   * @returns {Promise<AuthenticationChallenge>}
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
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
   * Verify Challenge
   *
   * Verifies an Authentication Challenge.
   * @param options - Object containing code.
   * @returns {Promise<AuthenticationChallengeVerifyResponse>}
   * @throws {BadRequestException} 400
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * Enroll an authentication factor
   *
   * Enrolls a user in a new [authentication factor](https://workos.com/docs/reference/authkit/mfa/authentication-factor).
   * @param payload - Object containing type.
   * @returns {Promise<UserAuthenticationFactorEnrollResponse>}
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * List authentication factors
   *
   * Lists the [authentication factors](https://workos.com/docs/reference/authkit/mfa/authentication-factor) for a user.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<AuthenticationFactor>>}
   * @throws {UnprocessableEntityException} 422
   */
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
