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
  AuthenticateWithRefreshTokenOptions,
  SerializedAuthenticateWithRefreshTokenOptions,
  MagicAuth,
  MagicAuthResponse,
  CreateMagicAuthOptions,
  SerializedCreateMagicAuthOptions,
  EmailVerification,
  EmailVerificationResponse,
  PasswordReset,
  PasswordResetResponse,
  CreatePasswordResetOptions,
  SerializedCreatePasswordResetOptions,
} from './interfaces';
import {
  deserializeAuthenticationResponse,
  deserializeFactorWithSecrets,
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
  serializeAuthenticateWithRefreshTokenOptions,
  serializeCreateMagicAuthOptions,
  deserializeMagicAuth,
  deserializeEmailVerification,
  deserializePasswordReset,
  serializeCreatePasswordResetOptions,
} from './serializers';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { Challenge, ChallengeResponse } from '../mfa/interfaces';
import { deserializeChallenge } from '../mfa/serializers';
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
import {
  Factor,
  FactorResponse,
  FactorWithSecrets,
  FactorWithSecretsResponse,
} from './interfaces/factor.interface';
import { deserializeFactor } from './serializers/factor.serializer';
import {
  RevokeSessionOptions,
  SerializedRevokeSessionOptions,
  serializeRevokeSessionOptions,
} from './interfaces/revoke-session-options.interface';
import {
  SerializedUpdateOrganizationMembershipOptions,
  UpdateOrganizationMembershipOptions,
} from './interfaces/update-organization-membership-options.interface';
import { serializeUpdateOrganizationMembershipOptions } from './serializers/update-organization-membership-options.serializer';
import { Identity, IdentityResponse } from './interfaces/identity.interface';
import { deserializeIdentities } from './serializers/identity.serializer';
import {
  AccessToken,
  AuthenticateWithSessionCookieFailedResponse,
  AuthenticateWithSessionCookieSuccessResponse,
  SessionCookieData,
} from './interfaces/authenticate-with-session-cookie.interface';
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
import { unsealData } from 'iron-session';

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
  private jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

  constructor(private readonly workos: WorkOS) {
    const { clientId } = workos.options;

    // Set the JWKS URL. This is used to verify if the JWT is still valid
    this.jwks = clientId
      ? createRemoteJWKSet(new URL(this.getJwksUrl(clientId)))
      : undefined;
  }

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
      options ? serializeListUsersOptions(options) : undefined,
    );
  }

  async createUser(payload: CreateUserOptions): Promise<User> {
    const { data } = await this.workos.post<
      UserResponse,
      SerializedCreateUserOptions
    >('/user_management/users', serializeCreateUserOptions(payload));

    return deserializeUser(data);
  }

  async authenticateWithMagicAuth(
    payload: AuthenticateWithMagicAuthOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
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

  async authenticateWithRefreshToken(
    payload: AuthenticateWithRefreshTokenOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithRefreshTokenOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithRefreshTokenOptions({
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

  async authenticateWithSessionCookie({
    sessionCookie,
    cookiePassword = process.env.WORKOS_COOKIE_PASSWORD,
  }: {
    sessionCookie: string;
    cookiePassword?: string;
  }): Promise<
    | AuthenticateWithSessionCookieSuccessResponse
    | AuthenticateWithSessionCookieFailedResponse
  > {
    if (!cookiePassword) {
      throw new Error('Cookie password is required');
    }

    if (!this.jwks) {
      throw new Error('Must provide clientId to initialize JWKS');
    }

    if (!sessionCookie) {
      return { authenticated: false, reason: 'no_session_cookie_provided' };
    }

    const session = await unsealData<SessionCookieData>(sessionCookie, {
      password: cookiePassword,
    });

    if (!session.accessToken) {
      return { authenticated: false, reason: 'invalid_session_cookie' };
    }

    if (!(await this.isValidJwt(session.accessToken))) {
      return { authenticated: false, reason: 'invalid_jwt' };
    }

    const {
      sid: sessionId,
      org_id: organizationId,
      role,
      permissions,
    } = decodeJwt<AccessToken>(session.accessToken);

    return {
      authenticated: true,
      sessionId,
      organizationId,
      role,
      permissions,
    };
  }

  private async isValidJwt(accessToken: string): Promise<boolean> {
    if (!this.jwks) {
      throw new Error('Must provide clientId to initialize JWKS');
    }

    try {
      await jwtVerify(accessToken, this.jwks);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to verify session:', e);
      return false;
    }
  }

  async getEmailVerification(
    emailVerificationId: string,
  ): Promise<EmailVerification> {
    const { data } = await this.workos.get<EmailVerificationResponse>(
      `/user_management/email_verification/${emailVerificationId}`,
    );

    return deserializeEmailVerification(data);
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

  async getMagicAuth(magicAuthId: string): Promise<MagicAuth> {
    const { data } = await this.workos.get<MagicAuthResponse>(
      `/user_management/magic_auth/${magicAuthId}`,
    );

    return deserializeMagicAuth(data);
  }

  async createMagicAuth(options: CreateMagicAuthOptions): Promise<MagicAuth> {
    const { data } = await this.workos.post<
      MagicAuthResponse,
      SerializedCreateMagicAuthOptions
    >(
      '/user_management/magic_auth',
      serializeCreateMagicAuthOptions({
        ...options,
      }),
    );

    return deserializeMagicAuth(data);
  }

  /**
   * @deprecated Please use `createMagicAuth` instead. This method will be removed in a future major version.
   */
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
      SerializedVerifyEmailOptions
    >(`/user_management/users/${userId}/email_verification/confirm`, {
      code,
    });

    return { user: deserializeUser(data.user) };
  }

  async getPasswordReset(passwordResetId: string): Promise<PasswordReset> {
    const { data } = await this.workos.get<PasswordResetResponse>(
      `/user_management/password_reset/${passwordResetId}`,
    );

    return deserializePasswordReset(data);
  }

  async createPasswordReset(
    options: CreatePasswordResetOptions,
  ): Promise<PasswordReset> {
    const { data } = await this.workos.post<
      PasswordResetResponse,
      SerializedCreatePasswordResetOptions
    >(
      '/user_management/password_reset',
      serializeCreatePasswordResetOptions({
        ...options,
      }),
    );

    return deserializePasswordReset(data);
  }

  /**
   * @deprecated Please use `createPasswordReset` instead. This method will be removed in a future major version.
   */
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
    authenticationFactor: FactorWithSecrets;
    authenticationChallenge: Challenge;
  }> {
    const { data } = await this.workos.post<{
      authentication_factor: FactorWithSecretsResponse;
      authentication_challenge: ChallengeResponse;
    }>(
      `/user_management/users/${payload.userId}/auth_factors`,
      serializeEnrollAuthFactorOptions(payload),
    );

    return {
      authenticationFactor: deserializeFactorWithSecrets(
        data.authentication_factor,
      ),
      authenticationChallenge: deserializeChallenge(
        data.authentication_challenge,
      ),
    };
  }

  async listAuthFactors(
    options: ListAuthFactorsOptions,
  ): Promise<AutoPaginatable<Factor>> {
    const { userId, ...restOfOptions } = options;
    return new AutoPaginatable(
      await fetchAndDeserialize<FactorResponse, Factor>(
        this.workos,
        `/user_management/users/${userId}/auth_factors`,
        deserializeFactor,
        restOfOptions,
      ),
      (params) =>
        fetchAndDeserialize<FactorResponse, Factor>(
          this.workos,
          `/user_management/users/${userId}/auth_factors`,
          deserializeFactor,
          params,
        ),
      restOfOptions,
    );
  }

  async deleteUser(userId: string) {
    await this.workos.delete(`/user_management/users/${userId}`);
  }

  async getUserIdentities(userId: string): Promise<Identity[]> {
    if (!userId) {
      throw new TypeError(`Incomplete arguments. Need to specify 'userId'.`);
    }

    const { data } = await this.workos.get<IdentityResponse[]>(
      `/user_management/users/${userId}/identities`,
    );

    return deserializeIdentities(data);
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
      options
        ? serializeListOrganizationMembershipsOptions(options)
        : undefined,
    );
  }

  async createOrganizationMembership(
    options: CreateOrganizationMembershipOptions,
  ): Promise<OrganizationMembership> {
    const { data } = await this.workos.post<
      OrganizationMembershipResponse,
      SerializedCreateOrganizationMembershipOptions
    >(
      '/user_management/organization_memberships',
      serializeCreateOrganizationMembershipOptions(options),
    );

    return deserializeOrganizationMembership(data);
  }

  async updateOrganizationMembership(
    organizationMembershipId: string,
    options: UpdateOrganizationMembershipOptions,
  ): Promise<OrganizationMembership> {
    const { data } = await this.workos.put<
      OrganizationMembershipResponse,
      SerializedUpdateOrganizationMembershipOptions
    >(
      `/user_management/organization_memberships/${organizationMembershipId}`,
      serializeUpdateOrganizationMembershipOptions(options),
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

  async deactivateOrganizationMembership(
    organizationMembershipId: string,
  ): Promise<OrganizationMembership> {
    const { data } = await this.workos.put<OrganizationMembershipResponse>(
      `/user_management/organization_memberships/${organizationMembershipId}/deactivate`,
      {},
    );

    return deserializeOrganizationMembership(data);
  }

  async reactivateOrganizationMembership(
    organizationMembershipId: string,
  ): Promise<OrganizationMembership> {
    const { data } = await this.workos.put<OrganizationMembershipResponse>(
      `/user_management/organization_memberships/${organizationMembershipId}/reactivate`,
      {},
    );

    return deserializeOrganizationMembership(data);
  }

  async getInvitation(invitationId: string): Promise<Invitation> {
    const { data } = await this.workos.get<InvitationResponse>(
      `/user_management/invitations/${invitationId}`,
    );

    return deserializeInvitation(data);
  }

  async findInvitationByToken(invitationToken: string): Promise<Invitation> {
    const { data } = await this.workos.get<InvitationResponse>(
      `/user_management/invitations/by_token/${invitationToken}`,
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
      options ? serializeListInvitationsOptions(options) : undefined,
    );
  }

  async sendInvitation(payload: SendInvitationOptions): Promise<Invitation> {
    const { data } = await this.workos.post<
      InvitationResponse,
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

  async revokeSession(payload: RevokeSessionOptions): Promise<void> {
    await this.workos.post<void, SerializedRevokeSessionOptions>(
      '/user_management/sessions/revoke',
      serializeRevokeSessionOptions(payload),
    );
  }

  getAuthorizationUrl({
    connectionId,
    codeChallenge,
    codeChallengeMethod,
    clientId,
    domainHint,
    loginHint,
    organizationId,
    provider,
    redirectUri,
    state,
    screenHint,
  }: AuthorizationURLOptions): string {
    if (!provider && !connectionId && !organizationId) {
      throw new TypeError(
        `Incomplete arguments. Need to specify either a 'connectionId', 'organizationId', or 'provider'.`,
      );
    }

    if (provider !== 'authkit' && screenHint) {
      throw new TypeError(
        `'screenHint' is only supported for 'authkit' provider`,
      );
    }

    const query = toQueryString({
      connection_id: connectionId,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      organization_id: organizationId,
      domain_hint: domainHint,
      login_hint: loginHint,
      provider,
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      screen_hint: screenHint,
    });

    return `${this.workos.baseURL}/user_management/authorize?${query}`;
  }

  getLogoutUrl({ sessionId }: { sessionId: string }): string {
    if (!sessionId) {
      throw new TypeError(`Incomplete arguments. Need to specify 'sessionId'.`);
    }

    return `${this.workos.baseURL}/user_management/sessions/logout?session_id=${sessionId}`;
  }

  getJwksUrl(clientId: string): string {
    if (!clientId) {
      throw TypeError('clientId must be a valid clientId');
    }
    return `${this.workos.baseURL}/sso/jwks/${clientId}`;
  }
}
