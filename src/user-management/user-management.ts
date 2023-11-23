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
  CreateUserOptions,
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
  SerializedVerifyEmailOptions,
  UpdateUserOptions,
  User,
  UserResponse,
  VerifyEmailOptions,
} from './interfaces';
import {
  deserializeAuthenticationResponse,
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
import { serializeListOrganizationMembershipsOptions } from './serializers/list-organization-memberships-options.serializer';
import {
  CreateOrganizationMembershipOptions,
  SerializedCreateOrganizationMembershipOptions,
} from './interfaces/create-organization-membership-options.interface';
import { serializeCreateOrganizationMembershipOptions } from './serializers/create-organization-membership-options.serializer';
import {
  Invitation,
  InvitationResponse,
} from './interfaces/invitation.interface';
import { deserializeInvitation } from './serializers/invitation.serializer';
import { ListInvitationsOptions } from './interfaces/list-invitations-options.interface';
import { serializeListInvitationsOptions } from './serializers/list-invitations-options.serializer';
import {
  SendInvitationOptions,
  SerializedSendInvitationOptions,
} from './interfaces/send-invitation-options.interface';
import { serializeSendInvitationOptions } from './serializers/send-invitation-options.serializer';
import { serializeListUsersOptions } from './serializers/list-users-options.serializer';
import { AuthorizationURLOptions } from './interfaces/authorization-url-options.interface';
import { serializeAuthenticateWithEmailVerificationOptions } from './serializers/authenticate-with-email-verification.serializer';
import {
  AuthenticateWithEmailVerificationOptions,
  SerializedAuthenticateWithEmailVerificationOptions,
} from './interfaces/authenticate-with-email-verification-options.interface';
import {
  AuthenticateWithOrganizationSelectionOptions,
  SerializedAuthenticateWithOrganizationSelectionOptions,
} from './interfaces/authenticate-with-organization-selection.interface';
import { serializeAuthenticateWithOrganizationSelectionOptions } from './serializers/authenticate-with-organization-selection-options.serializer';

const toQueryString = (options: Record<string, string | undefined>): string => {
  const searchParams = new URLSearchParams();
  const keys = Object.keys(options).sort();

  for (const key of keys) {
    const value = options[key];

    if (value) {
      searchParams.append(key, value);
    }
  }

  return searchParams.toString();
};

export class UserManagement {
  constructor(private readonly workos: WorkOS) {}

  async getUser(userId: string): Promise<User> {
    const { data } = await this.workos.get<UserResponse>(
      `/user_management/users/${userId}`,
    );

    return deserializeUser(data);
  }

  async listUsers(options?: ListUsersOptions): Promise<AutoPaginatable<User>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<UserResponse, User>(
        this.workos,
        '/user_management/users',
        deserializeUser,
        options ? serializeListUsersOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<UserResponse, User>(
          this.workos,
          '/user_management/users',
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
    >('/user_management/users', serializeCreateUserOptions(payload));

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

  async authenticateWithEmailVerification(
    payload: AuthenticateWithEmailVerificationOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      any,
      SerializedAuthenticateWithEmailVerificationOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithEmailVerificationOptions({
        ...payload,
        clientSecret: this.workos.key,
      }),
    );

    return deserializeAuthenticationResponse(data);
  }

  async authenticateWithOrganizationSelection(
    payload: AuthenticateWithOrganizationSelectionOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      any,
      SerializedAuthenticateWithOrganizationSelectionOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithOrganizationSelectionOptions({
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
      `/user_management/users/${userId}/email_verification/send`,
      {},
    );

    return { user: deserializeUser(data.user) };
  }

  async sendMagicAuthCode(options: SendMagicAuthCodeOptions): Promise<void> {
    await this.workos.post<any, SerializedSendMagicAuthCodeOptions>(
      '/user_management/magic_auth/send',
      serializeSendMagicAuthCodeOptions(options),
    );
  }

  async verifyEmail({
    code,
    userId,
  }: VerifyEmailOptions): Promise<{ user: User }> {
    const { data } = await this.workos.post<
      { user: UserResponse },
      any,
      SerializedVerifyEmailOptions
    >(`/user_management/users/${userId}/email_verification/confirm`, {
      code,
    });

    return { user: deserializeUser(data.user) };
  }

  async sendPasswordResetEmail(
    payload: SendPasswordResetEmailOptions,
  ): Promise<void> {
    await this.workos.post<any, SerializedSendPasswordResetEmailOptions>(
      '/user_management/password_reset/send',
      serializeSendPasswordResetEmailOptions(payload),
    );
  }

  async resetPassword(payload: ResetPasswordOptions): Promise<{ user: User }> {
    const { data } = await this.workos.post<
      { user: UserResponse },
      any,
      SerializedResetPasswordOptions
    >(
      '/user_management/password_reset/confirm',
      serializeResetPasswordOptions(payload),
    );

    return { user: deserializeUser(data.user) };
  }

  async updateUser(payload: UpdateUserOptions): Promise<User> {
    const { data } = await this.workos.put<UserResponse>(
      `/user_management/users/${payload.userId}`,
      serializeUpdateUserOptions(payload),
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
      `/user_management/users/${payload.userId}/auth_factors`,
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
        `/user_management/users/${options.userId}/auth_factors`,
        deserializeFactor,
        options,
      ),
      (params) =>
        fetchAndDeserialize<FactorResponse, Factor>(
          this.workos,
          `/user_management/users/${options.userId}/auth_factors`,
          deserializeFactor,
          params,
        ),
      options,
    );
  }

  async deleteUser(userId: string) {
    await this.workos.delete(`/user_management/users/${userId}`);
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
        options
          ? serializeListOrganizationMembershipsOptions(options)
          : undefined,
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
    const { data } = await this.workos.post<
      OrganizationMembershipResponse,
      any,
      SerializedCreateOrganizationMembershipOptions
    >(
      '/user_management/organization_memberships',
      serializeCreateOrganizationMembershipOptions(options),
    );

    return deserializeOrganizationMembership(data);
  }

  async deleteOrganizationMembership(
    organizationMembershipId: string,
  ): Promise<void> {
    await this.workos.delete(
      `/user_management/organization_memberships/${organizationMembershipId}`,
    );
  }

  async getInvitation(invitationId: string): Promise<Invitation> {
    const { data } = await this.workos.get<InvitationResponse>(
      `/user_management/invitations/${invitationId}`,
    );

    return deserializeInvitation(data);
  }

  async listInvitations(
    options: ListInvitationsOptions,
  ): Promise<AutoPaginatable<Invitation>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<InvitationResponse, Invitation>(
        this.workos,
        '/user_management/invitations',
        deserializeInvitation,
        options ? serializeListInvitationsOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<InvitationResponse, Invitation>(
          this.workos,
          '/user_management/invitations',
          deserializeInvitation,
          params,
        ),
      options,
    );
  }

  async sendInvitation(payload: SendInvitationOptions): Promise<Invitation> {
    const { data } = await this.workos.post<
      InvitationResponse,
      any,
      SerializedSendInvitationOptions
    >(
      '/user_management/invitations',
      serializeSendInvitationOptions({
        ...payload,
      }),
    );

    return deserializeInvitation(data);
  }

  async revokeInvitation(invitationId: string): Promise<Invitation> {
    const { data } = await this.workos.post<InvitationResponse, any>(
      `/user_management/invitations/${invitationId}/revoke`,
      null,
    );

    return deserializeInvitation(data);
  }

  getAuthorizationUrl({
    connectionId,
    clientId,
    domainHint,
    loginHint,
    organizationId,
    provider,
    redirectURI,
    state,
  }: AuthorizationURLOptions): string {
    if (!provider && !connectionId && !organizationId) {
      throw new Error(
        `Incomplete arguments. Need to specify either a 'connectionId', 'organizationId', or 'provider'.`,
      );
    }

    const query = toQueryString({
      connection_id: connectionId,
      organization_id: organizationId,
      domain_hint: domainHint,
      login_hint: loginHint,
      provider,
      client_id: clientId,
      redirect_uri: redirectURI,
      response_type: 'code',
      state,
    });

    return `${this.workos.baseURL}/user_management/authorize?${query}`;
  }
}
