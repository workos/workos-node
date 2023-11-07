import { WorkOS } from '../workos';
import { AutoPaginatable } from '../common/utils/pagination';
import {
  AddUserToOrganizationOptions,
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
  RemoveUserFromOrganizationOptions,
  SendMagicAuthCodeOptions,
  SendVerificationEmailOptions,
  SerializedAddUserToOrganizationOptions,
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
import {
  OrganizationMembership,
  OrganizationMembershipResponse,
} from './interfaces/organization-membership.interface';
import { deserializeOrganizationMembership } from './serializers/organization-membership.serializer';
import { ListOrganizationMembershipsOptions } from './interfaces/list-organization-memberships-options.interface';
import { CreateOrganizationMembershipOptions } from './interfaces/create-organization-membership-options.interface';

export class UserManagement {
  constructor(private readonly workos: WorkOS) {}

  async getUser(userId: string): Promise<User> {
    const { data } = await this.workos.get<UserResponse>(
      `/user_management/${userId}`,
    );

    return deserializeUser(data);
  }

  async listUsers(options?: ListUsersOptions): Promise<AutoPaginatable<User>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<UserResponse, User>(
        this.workos,
        '/user_management',
        deserializeUser,
        options,
      ),
      (params) =>
        fetchAndDeserialize<UserResponse, User>(
          this.workos,
          '/user_management',
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
    >('/user_management', serializeCreateUserOptions(payload));

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
      '/user_management/authenticate',
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
      '/user_management/authenticate',
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
      '/user_management/authenticate',
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
      '/user_management/authenticate',
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
      `/user_management/${userId}/send_verification_email`,
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
    >(
      '/user_management/magic_auth/send',
      serializeSendMagicAuthCodeOptions(options),
    );

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
    >(`/user_management/${userId}/verify_email_code`, {
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
      '/user_management/send_password_reset_email',
      serializeSendPasswordResetEmailOptions(payload),
    );

    return deserializeSendPasswordResetEmailResponse(data);
  }

  async resetPassword(payload: ResetPasswordOptions): Promise<{ user: User }> {
    const { data } = await this.workos.post<
      { user: UserResponse },
      any,
      SerializedResetPasswordOptions
    >(
      '/user_management/password_reset',
      serializeResetPasswordOptions(payload),
    );

    return { user: deserializeUser(data.user) };
  }

  async addUserToOrganization({
    userId,
    organizationId,
  }: AddUserToOrganizationOptions): Promise<User> {
    const { data } = await this.workos.post<
      UserResponse,
      any,
      SerializedAddUserToOrganizationOptions
    >(`/user_management/${userId}/organizations`, {
      organization_id: organizationId,
    });

    return deserializeUser(data);
  }

  async removeUserFromOrganization({
    userId,
    organizationId,
  }: RemoveUserFromOrganizationOptions): Promise<User> {
    const { data } = await this.workos.delete<UserResponse>(
      `/user_management/${userId}/organizations/${organizationId}`,
    );

    return deserializeUser(data);
  }

  async updateUser(payload: UpdateUserOptions): Promise<User> {
    const { data } = await this.workos.put<UserResponse>(
      `/user_management/${payload.userId}`,
      serializeUpdateUserOptions(payload),
    );

    return deserializeUser(data);
  }

  async updateUserPassword(payload: UpdateUserPasswordOptions): Promise<User> {
    const { data } = await this.workos.put<UserResponse>(
      `/user_management/${payload.userId}/password`,
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
      `/user_management/${payload.userId}/auth/factors`,
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
        `/user_management/${options.userId}/auth/factors`,
        deserializeFactor,
        options,
      ),
      (params) =>
        fetchAndDeserialize<FactorResponse, Factor>(
          this.workos,
          `/user_management/${options.userId}/auth/factors`,
          deserializeFactor,
          params,
        ),
      options,
    );
  }

  async deleteUser(payload: DeleteUserOptions) {
    await this.workos.delete(`/user_management/${payload.userId}`);
  }

  async getOrganizationMembership(
    organizationMembershipId: string,
  ): Promise<OrganizationMembership> {
    const { data } = await this.workos.get<OrganizationMembershipResponse>(
      `/user_management/organization_memberships/${organizationMembershipId}`,
    );

    return deserializeOrganizationMembership(data);
  }

  async listOrganizationMemberships(
    options: ListOrganizationMembershipsOptions,
  ): Promise<AutoPaginatable<OrganizationMembership>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<
        OrganizationMembershipResponse,
        OrganizationMembership
      >(
        this.workos,
        '/user_management/organization_memberships',
        deserializeOrganizationMembership,
        options,
      ),
      (params) =>
        fetchAndDeserialize<
          OrganizationMembershipResponse,
          OrganizationMembership
        >(
          this.workos,
          '/user_management/organization_memberships',
          deserializeOrganizationMembership,
          params,
        ),
      options,
    );
  }

  async createOrganizationMembership(
    options: CreateOrganizationMembershipOptions,
  ): Promise<OrganizationMembership> {
    const { data } = await this.workos.post<OrganizationMembershipResponse>(
      '/organization_memberships',
      options,
    );

    return deserializeOrganizationMembership(data);
  }
}
