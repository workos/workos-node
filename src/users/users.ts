import { WorkOS } from '../workos';
import { AutoPaginatable } from '../common/utils/pagination';
import {
  AuthenticateWithCodeOptions,
  AuthenticateWithMagicAuthOptions,
  AuthenticateWithPasswordOptions,
  AuthenticateWithTotpOptions,
  AuthenticationResponse,
  AuthenticationResponseResponse,
  ResetPasswordOptions,
  SendPasswordResetEmailOptions,
  SendPasswordResetEmailResponse,
  CreateUserOptions,
  DeleteUserOptions,
  EnrollAuthFactorOptions,
  ListAuthFactorsOptions,
  ListUsersOptions,
  SendMagicAuthCodeOptions,
  SendVerificationEmailOptions,
  SerializedAuthenticateWithCodeOptions,
  SerializedAuthenticateWithMagicAuthOptions,
  SerializedAuthenticateWithPasswordOptions,
  SerializedAuthenticateWithTotpOptions,
  SerializedResetPasswordOptions,
  SerializedSendPasswordResetEmailOptions,
  SerializedCreateUserOptions,
  SerializedSendMagicAuthCodeOptions,
  SerializedVerifyEmailCodeOptions,
  UpdateUserOptions,
  UpdateUserPasswordOptions,
  User,
  UserResponse,
  VerifyEmailCodeOptions,
  SendPasswordResetEmailResponseResponse,
} from './interfaces';
import {
  deserializeAuthenticationResponse,
  deserializeSendPasswordResetEmailResponse,
  deserializeUser,
  serializeAuthenticateWithMagicAuthOptions,
  serializeAuthenticateWithPasswordOptions,
  serializeAuthenticateWithCodeOptions,
  serializeAuthenticateWithTotpOptions,
  serializeEnrollAuthFactorOptions,
  serializeResetPasswordOptions,
  serializeSendPasswordResetEmailOptions,
  serializeCreateUserOptions,
  serializeSendMagicAuthCodeOptions,
  serializeUpdateUserOptions,
  serializeUpdateUserPasswordOptions,
} from './serializers';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import {
  Challenge,
  ChallengeResponse,
  Factor,
  FactorResponse,
} from '../mfa/interfaces';
import { deserializeChallenge, deserializeFactor } from '../mfa/serializers';

export class Users {
  constructor(private readonly workos: WorkOS) {}

  async getUser(userId: string): Promise<User> {
    const { data } = await this.workos.get<UserResponse>(`/users/${userId}`);

    return deserializeUser(data);
  }

  async listUsers(options?: ListUsersOptions): Promise<AutoPaginatable<User>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<UserResponse, User>(
        this.workos,
        '/users',
        deserializeUser,
        options,
      ),
      (params) =>
        fetchAndDeserialize<UserResponse, User>(
          this.workos,
          '/users',
          deserializeUser,
          params,
        ),
      options,
    );
  }

  async createUser(payload: CreateUserOptions): Promise<User> {
    const { data } = await this.workos.post<
      UserResponse,
      any,
      SerializedCreateUserOptions
    >('/users', serializeCreateUserOptions(payload));

    return deserializeUser(data);
  }

  async authenticateWithMagicAuth(
    payload: AuthenticateWithMagicAuthOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      any,
      SerializedAuthenticateWithMagicAuthOptions
    >(
      '/users/authenticate',
      serializeAuthenticateWithMagicAuthOptions({
        ...payload,
        clientSecret: this.workos.key,
      }),
    );

    return deserializeAuthenticationResponse(data);
  }

  async authenticateWithPassword(
    payload: AuthenticateWithPasswordOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      any,
      SerializedAuthenticateWithPasswordOptions
    >(
      '/users/authenticate',
      serializeAuthenticateWithPasswordOptions({
        ...payload,
        clientSecret: this.workos.key,
      }),
    );

    return deserializeAuthenticationResponse(data);
  }

  async authenticateWithCode(
    payload: AuthenticateWithCodeOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      any,
      SerializedAuthenticateWithCodeOptions
    >(
      '/users/authenticate',
      serializeAuthenticateWithCodeOptions({
        ...payload,
        clientSecret: this.workos.key,
      }),
    );

    return deserializeAuthenticationResponse(data);
  }

  async authenticateWithTotp(
    payload: AuthenticateWithTotpOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      any,
      SerializedAuthenticateWithTotpOptions
    >(
      '/users/authenticate',
      serializeAuthenticateWithTotpOptions({
        ...payload,
        clientSecret: this.workos.key,
      }),
    );

    return deserializeAuthenticationResponse(data);
  }

  async sendVerificationEmail({
    userId,
  }: SendVerificationEmailOptions): Promise<{ user: User }> {
    const { data } = await this.workos.post<{ user: UserResponse }>(
      `/users/${userId}/send_verification_email`,
      {},
    );

    return { user: deserializeUser(data.user) };
  }

  async sendMagicAuthCode(
    options: SendMagicAuthCodeOptions,
  ): Promise<{ user: User }> {
    const { data } = await this.workos.post<
      { user: UserResponse },
      any,
      SerializedSendMagicAuthCodeOptions
    >('/users/magic_auth/send', serializeSendMagicAuthCodeOptions(options));

    return { user: deserializeUser(data.user) };
  }

  async verifyEmailCode({
    code,
    userId,
  }: VerifyEmailCodeOptions): Promise<{ user: User }> {
    const { data } = await this.workos.post<
      { user: UserResponse },
      any,
      SerializedVerifyEmailCodeOptions
    >(`/users/${userId}/verify_email_code`, {
      code,
    });

    return { user: deserializeUser(data.user) };
  }

  async sendPasswordResetEmail(
    payload: SendPasswordResetEmailOptions,
  ): Promise<SendPasswordResetEmailResponse> {
    const { data } = await this.workos.post<
      SendPasswordResetEmailResponseResponse,
      any,
      SerializedSendPasswordResetEmailOptions
    >(
      '/users/send_password_reset_email',
      serializeSendPasswordResetEmailOptions(payload),
    );

    return deserializeSendPasswordResetEmailResponse(data);
  }

  async resetPassword(payload: ResetPasswordOptions): Promise<{ user: User }> {
    const { data } = await this.workos.post<
      { user: UserResponse },
      any,
      SerializedResetPasswordOptions
    >('/users/password_reset', serializeResetPasswordOptions(payload));

    return { user: deserializeUser(data.user) };
  }

  async updateUser(payload: UpdateUserOptions): Promise<User> {
    const { data } = await this.workos.put<UserResponse>(
      `/users/${payload.userId}`,
      serializeUpdateUserOptions(payload),
    );

    return deserializeUser(data);
  }

  async updateUserPassword(payload: UpdateUserPasswordOptions): Promise<User> {
    const { data } = await this.workos.put<UserResponse>(
      `/users/${payload.userId}/password`,
      serializeUpdateUserPasswordOptions(payload),
    );

    return deserializeUser(data);
  }

  async enrollAuthFactor(payload: EnrollAuthFactorOptions): Promise<{
    authenticationFactor: Factor;
    authenticationChallenge: Challenge;
  }> {
    const { data } = await this.workos.post<{
      authentication_factor: FactorResponse;
      authentication_challenge: ChallengeResponse;
    }>(
      `/users/${payload.userId}/auth/factors`,
      serializeEnrollAuthFactorOptions(payload),
    );

    return {
      authenticationFactor: deserializeFactor(data.authentication_factor),
      authenticationChallenge: deserializeChallenge(
        data.authentication_challenge,
      ),
    };
  }

  async listAuthFactors(
    options: ListAuthFactorsOptions,
  ): Promise<AutoPaginatable<Factor>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<FactorResponse, Factor>(
        this.workos,
        `/users/${options.userId}/auth/factors`,
        deserializeFactor,
        options,
      ),
      (params) =>
        fetchAndDeserialize<FactorResponse, Factor>(
          this.workos,
          `/users/${options.userId}/auth/factors`,
          deserializeFactor,
          params,
        ),
      options,
    );
  }

  async deleteUser(payload: DeleteUserOptions) {
    await this.workos.delete(`/users/${payload.userId}`);
  }
}
