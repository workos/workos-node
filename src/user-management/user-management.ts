import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
import { OauthException } from '../common/exceptions/oauth.exception';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { AutoPaginatable } from '../common/utils/pagination';
import { Challenge, ChallengeResponse } from '../mfa/interfaces';
import { deserializeChallenge } from '../mfa/serializers';
import { WorkOS } from '../workos';
import {
  AuthenticateWithCodeOptions,
  AuthenticateWithMagicAuthOptions,
  AuthenticateWithPasswordOptions,
  AuthenticateWithRefreshTokenOptions,
  AuthenticateWithSessionOptions,
  AuthenticateWithTotpOptions,
  AuthenticationResponse,
  AuthenticationResponseResponse,
  CreateMagicAuthOptions,
  CreatePasswordResetOptions,
  CreateUserOptions,
  EmailVerification,
  EmailVerificationResponse,
  EnrollAuthFactorOptions,
  ListAuthFactorsOptions,
  ListUsersOptions,
  MagicAuth,
  MagicAuthResponse,
  PasswordReset,
  PasswordResetResponse,
  ResetPasswordOptions,
  SendMagicAuthCodeOptions,
  SendPasswordResetEmailOptions,
  SendVerificationEmailOptions,
  SerializedAuthenticateWithCodeOptions,
  SerializedAuthenticateWithMagicAuthOptions,
  SerializedAuthenticateWithPasswordOptions,
  SerializedAuthenticateWithRefreshTokenOptions,
  SerializedAuthenticateWithTotpOptions,
  SerializedCreateMagicAuthOptions,
  SerializedCreatePasswordResetOptions,
  SerializedCreateUserOptions,
  SerializedResetPasswordOptions,
  SerializedSendMagicAuthCodeOptions,
  SerializedSendPasswordResetEmailOptions,
  SerializedVerifyEmailOptions,
  UpdateUserOptions,
  User,
  UserResponse,
  VerifyEmailOptions,
} from './interfaces';
import {
  AuthenticateWithEmailVerificationOptions,
  SerializedAuthenticateWithEmailVerificationOptions,
} from './interfaces/authenticate-with-email-verification-options.interface';
import {
  AuthenticateWithOrganizationSelectionOptions,
  SerializedAuthenticateWithOrganizationSelectionOptions,
} from './interfaces/authenticate-with-organization-selection.interface';
import {
  AccessToken,
  AuthenticateWithSessionCookieFailedResponse,
  AuthenticateWithSessionCookieFailureReason,
  AuthenticateWithSessionCookieOptions,
  AuthenticateWithSessionCookieSuccessResponse,
  SessionCookieData,
} from './interfaces/authenticate-with-session-cookie.interface';
import { AuthorizationURLOptions } from './interfaces/authorization-url-options.interface';
import {
  CreateOrganizationMembershipOptions,
  SerializedCreateOrganizationMembershipOptions,
} from './interfaces/create-organization-membership-options.interface';
import {
  Factor,
  FactorResponse,
  FactorWithSecrets,
  FactorWithSecretsResponse,
} from './interfaces/factor.interface';
import { Identity, IdentityResponse } from './interfaces/identity.interface';
import {
  Invitation,
  InvitationResponse,
} from './interfaces/invitation.interface';
import { ListInvitationsOptions } from './interfaces/list-invitations-options.interface';
import { ListOrganizationMembershipsOptions } from './interfaces/list-organization-memberships-options.interface';
import {
  OrganizationMembership,
  OrganizationMembershipResponse,
} from './interfaces/organization-membership.interface';
import {
  RefreshAndSealSessionDataFailureReason,
  RefreshAndSealSessionDataResponse,
} from './interfaces/refresh-and-seal-session-data.interface';
import {
  RevokeSessionOptions,
  SerializedRevokeSessionOptions,
  serializeRevokeSessionOptions,
} from './interfaces/revoke-session-options.interface';
import {
  SendInvitationOptions,
  SerializedSendInvitationOptions,
} from './interfaces/send-invitation-options.interface';
import { SessionHandlerOptions } from './interfaces/session-handler-options.interface';
import {
  SerializedUpdateOrganizationMembershipOptions,
  UpdateOrganizationMembershipOptions,
} from './interfaces/update-organization-membership-options.interface';
import {
  deserializeAuthenticationResponse,
  deserializeEmailVerification,
  deserializeFactorWithSecrets,
  deserializeMagicAuth,
  deserializePasswordReset,
  deserializeUser,
  serializeAuthenticateWithCodeOptions,
  serializeAuthenticateWithMagicAuthOptions,
  serializeAuthenticateWithPasswordOptions,
  serializeAuthenticateWithRefreshTokenOptions,
  serializeAuthenticateWithTotpOptions,
  serializeCreateMagicAuthOptions,
  serializeCreatePasswordResetOptions,
  serializeCreateUserOptions,
  serializeEnrollAuthFactorOptions,
  serializeResetPasswordOptions,
  serializeSendMagicAuthCodeOptions,
  serializeSendPasswordResetEmailOptions,
  serializeUpdateUserOptions,
} from './serializers';
import { serializeAuthenticateWithEmailVerificationOptions } from './serializers/authenticate-with-email-verification.serializer';
import { serializeAuthenticateWithOrganizationSelectionOptions } from './serializers/authenticate-with-organization-selection-options.serializer';
import { serializeCreateOrganizationMembershipOptions } from './serializers/create-organization-membership-options.serializer';
import { deserializeFactor } from './serializers/factor.serializer';
import { deserializeIdentities } from './serializers/identity.serializer';
import { deserializeInvitation } from './serializers/invitation.serializer';
import { serializeListInvitationsOptions } from './serializers/list-invitations-options.serializer';
import { serializeListOrganizationMembershipsOptions } from './serializers/list-organization-memberships-options.serializer';
import { serializeListUsersOptions } from './serializers/list-users-options.serializer';
import { deserializeOrganizationMembership } from './serializers/organization-membership.serializer';
import { serializeSendInvitationOptions } from './serializers/send-invitation-options.serializer';
import { serializeUpdateOrganizationMembershipOptions } from './serializers/update-organization-membership-options.serializer';
import { IronSessionProvider } from '../common/iron-session/iron-session-provider';
import { Session } from './session';

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
  private _jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
  public clientId: string | undefined;
  public ironSessionProvider: IronSessionProvider;

  constructor(
    private readonly workos: WorkOS,
    ironSessionProvider: IronSessionProvider,
  ) {
    const { clientId } = workos.options;

    this.clientId = clientId;
    this.ironSessionProvider = ironSessionProvider;
  }

  get jwks(): ReturnType<typeof createRemoteJWKSet> | undefined {
    if (!this.clientId) {
      return;
    }

    // Set the JWKS URL. This is used to verify if the JWT is still valid
    this._jwks ??= createRemoteJWKSet(new URL(this.getJwksUrl(this.clientId)), {
      cooldownDuration: 1000 * 60 * 5,
    });

    return this._jwks;
  }

  /**
   * Loads a sealed session using the provided session data and cookie password.
   *
   * @param options - The options for loading the sealed session.
   * @param options.sessionData - The sealed session data.
   * @param options.cookiePassword - The password used to encrypt the session data.
   * @returns The session class.
   */
  loadSealedSession(options: {
    sessionData: string;
    cookiePassword: string;
  }): Session {
    return new Session(this, options.sessionData, options.cookiePassword);
  }

  async getUser(userId: string): Promise<User> {
    const { data } = await this.workos.get<UserResponse>(
      `/user_management/users/${userId}`,
    );

    return deserializeUser(data);
  }

  async getUserByExternalId(externalId: string): Promise<User> {
    const { data } = await this.workos.get<UserResponse>(
      `/user_management/users/external_id/${externalId}`,
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
    const { session, ...remainingPayload } = payload;

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithMagicAuthOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithMagicAuthOptions({
        ...remainingPayload,
        clientSecret: this.workos.key,
      }),
    );

    return this.prepareAuthenticationResponse({
      authenticationResponse: deserializeAuthenticationResponse(data),
      session,
    });
  }

  async authenticateWithPassword(
    payload: AuthenticateWithPasswordOptions,
  ): Promise<AuthenticationResponse> {
    const { session, ...remainingPayload } = payload;

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithPasswordOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithPasswordOptions({
        ...remainingPayload,
        clientSecret: this.workos.key,
      }),
    );

    return this.prepareAuthenticationResponse({
      authenticationResponse: deserializeAuthenticationResponse(data),
      session,
    });
  }

  async authenticateWithCode(
    payload: AuthenticateWithCodeOptions,
  ): Promise<AuthenticationResponse> {
    const { session, ...remainingPayload } = payload;

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithCodeOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithCodeOptions({
        ...remainingPayload,
        clientSecret: this.workos.key,
      }),
    );

    return this.prepareAuthenticationResponse({
      authenticationResponse: deserializeAuthenticationResponse(data),
      session,
    });
  }

  async authenticateWithRefreshToken(
    payload: AuthenticateWithRefreshTokenOptions,
  ): Promise<AuthenticationResponse> {
    const { session, ...remainingPayload } = payload;

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithRefreshTokenOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithRefreshTokenOptions({
        ...remainingPayload,
        clientSecret: this.workos.key,
      }),
    );

    return this.prepareAuthenticationResponse({
      authenticationResponse: deserializeAuthenticationResponse(data),
      session,
    });
  }

  async authenticateWithTotp(
    payload: AuthenticateWithTotpOptions,
  ): Promise<AuthenticationResponse> {
    const { session, ...remainingPayload } = payload;

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithTotpOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithTotpOptions({
        ...remainingPayload,
        clientSecret: this.workos.key,
      }),
    );

    return this.prepareAuthenticationResponse({
      authenticationResponse: deserializeAuthenticationResponse(data),
      session,
    });
  }

  async authenticateWithEmailVerification(
    payload: AuthenticateWithEmailVerificationOptions,
  ): Promise<AuthenticationResponse> {
    const { session, ...remainingPayload } = payload;

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithEmailVerificationOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithEmailVerificationOptions({
        ...remainingPayload,
        clientSecret: this.workos.key,
      }),
    );

    return this.prepareAuthenticationResponse({
      authenticationResponse: deserializeAuthenticationResponse(data),
      session,
    });
  }

  async authenticateWithOrganizationSelection(
    payload: AuthenticateWithOrganizationSelectionOptions,
  ): Promise<AuthenticationResponse> {
    const { session, ...remainingPayload } = payload;

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithOrganizationSelectionOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithOrganizationSelectionOptions({
        ...remainingPayload,
        clientSecret: this.workos.key,
      }),
    );

    return this.prepareAuthenticationResponse({
      authenticationResponse: deserializeAuthenticationResponse(data),
      session,
    });
  }

  async authenticateWithSessionCookie({
    sessionData,
    cookiePassword = process.env.WORKOS_COOKIE_PASSWORD,
  }: AuthenticateWithSessionCookieOptions): Promise<
    | AuthenticateWithSessionCookieSuccessResponse
    | AuthenticateWithSessionCookieFailedResponse
  > {
    if (!cookiePassword) {
      throw new Error('Cookie password is required');
    }

    if (!this.jwks) {
      throw new Error('Must provide clientId to initialize JWKS');
    }

    if (!sessionData) {
      return {
        authenticated: false,
        reason:
          AuthenticateWithSessionCookieFailureReason.NO_SESSION_COOKIE_PROVIDED,
      };
    }

    const session =
      await this.ironSessionProvider.unsealData<SessionCookieData>(
        sessionData,
        {
          password: cookiePassword,
        },
      );

    if (!session.accessToken) {
      return {
        authenticated: false,
        reason:
          AuthenticateWithSessionCookieFailureReason.INVALID_SESSION_COOKIE,
      };
    }

    if (!(await this.isValidJwt(session.accessToken))) {
      return {
        authenticated: false,
        reason: AuthenticateWithSessionCookieFailureReason.INVALID_JWT,
      };
    }

    const {
      sid: sessionId,
      org_id: organizationId,
      role,
      permissions,
      entitlements,
    } = decodeJwt<AccessToken>(session.accessToken);

    return {
      authenticated: true,
      sessionId,
      organizationId,
      role,
      user: session.user,
      permissions,
      entitlements,
      accessToken: session.accessToken,
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
      return false;
    }
  }

  /**
   * @deprecated This method is deprecated and will be removed in a future major version.
   * Please use the new `loadSealedSession` helper and its corresponding methods instead.
   */
  async refreshAndSealSessionData({
    sessionData,
    organizationId,
    cookiePassword = process.env.WORKOS_COOKIE_PASSWORD,
  }: SessionHandlerOptions): Promise<RefreshAndSealSessionDataResponse> {
    if (!cookiePassword) {
      throw new Error('Cookie password is required');
    }

    if (!sessionData) {
      return {
        authenticated: false,
        reason:
          RefreshAndSealSessionDataFailureReason.NO_SESSION_COOKIE_PROVIDED,
      };
    }

    const session =
      await this.ironSessionProvider.unsealData<SessionCookieData>(
        sessionData,
        {
          password: cookiePassword,
        },
      );

    if (!session.refreshToken || !session.user) {
      return {
        authenticated: false,
        reason: RefreshAndSealSessionDataFailureReason.INVALID_SESSION_COOKIE,
      };
    }

    const { org_id: organizationIdFromAccessToken } = decodeJwt<AccessToken>(
      session.accessToken,
    );

    try {
      const { sealedSession } = await this.authenticateWithRefreshToken({
        clientId: this.workos.clientId as string,
        refreshToken: session.refreshToken,
        organizationId: organizationId ?? organizationIdFromAccessToken,
        session: { sealSession: true, cookiePassword },
      });

      if (!sealedSession) {
        return {
          authenticated: false,
          reason: RefreshAndSealSessionDataFailureReason.INVALID_SESSION_COOKIE,
        };
      }

      return {
        authenticated: true,
        sealedSession,
      };
    } catch (error) {
      if (
        error instanceof OauthException &&
        // TODO: Add additional known errors and remove re-throw
        (error.error === RefreshAndSealSessionDataFailureReason.INVALID_GRANT ||
          error.error ===
            RefreshAndSealSessionDataFailureReason.MFA_ENROLLMENT ||
          error.error === RefreshAndSealSessionDataFailureReason.SSO_REQUIRED)
      ) {
        return {
          authenticated: false,
          reason: error.error,
        };
      }

      throw error;
    }
  }

  private async prepareAuthenticationResponse({
    authenticationResponse,
    session,
  }: {
    authenticationResponse: AuthenticationResponse;
    session?: AuthenticateWithSessionOptions;
  }): Promise<AuthenticationResponse> {
    if (session?.sealSession) {
      return {
        ...authenticationResponse,
        sealedSession: await this.sealSessionDataFromAuthenticationResponse({
          authenticationResponse,
          cookiePassword: session.cookiePassword,
        }),
      };
    }

    return authenticationResponse;
  }

  private async sealSessionDataFromAuthenticationResponse({
    authenticationResponse,
    cookiePassword,
  }: {
    authenticationResponse: AuthenticationResponse;
    cookiePassword?: string;
  }): Promise<string> {
    if (!cookiePassword) {
      throw new Error('Cookie password is required');
    }

    const { org_id: organizationIdFromAccessToken } = decodeJwt<AccessToken>(
      authenticationResponse.accessToken,
    );

    const sessionData: SessionCookieData = {
      organizationId: organizationIdFromAccessToken,
      user: authenticationResponse.user,
      accessToken: authenticationResponse.accessToken,
      refreshToken: authenticationResponse.refreshToken,
      impersonator: authenticationResponse.impersonator,
    };

    return this.ironSessionProvider.sealData(sessionData, {
      password: cookiePassword,
    });
  }

  async getSessionFromCookie({
    sessionData,
    cookiePassword = process.env.WORKOS_COOKIE_PASSWORD,
  }: SessionHandlerOptions): Promise<SessionCookieData | undefined> {
    if (!cookiePassword) {
      throw new Error('Cookie password is required');
    }

    if (sessionData) {
      return this.ironSessionProvider.unsealData<SessionCookieData>(
        sessionData,
        {
          password: cookiePassword,
        },
      );
    }

    return undefined;
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
   * @deprecated Please use `createMagicAuth` instead.
   * This method will be removed in a future major version.
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

  async acceptInvitation(invitationId: string): Promise<Invitation> {
    const { data } = await this.workos.post<InvitationResponse, any>(
      `/user_management/invitations/${invitationId}/accept`,
      null,
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
    context,
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

    if (context) {
      this.workos.emitWarning(
        `\`context\` is deprecated. We previously required initiate login endpoints to return the
\`context\` query parameter when getting the authorization URL. This is no longer necessary.`,
      );
    }

    const query = toQueryString({
      connection_id: connectionId,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      context,
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

  getLogoutUrl({
    sessionId,
    returnTo,
  }: {
    sessionId: string;
    returnTo?: string;
  }): string {
    if (!sessionId) {
      throw new TypeError(`Incomplete arguments. Need to specify 'sessionId'.`);
    }

    const url = new URL(
      '/user_management/sessions/logout',
      this.workos.baseURL,
    );

    url.searchParams.set('session_id', sessionId);
    if (returnTo) {
      url.searchParams.set('return_to', returnTo);
    }

    return url.toString();
  }

  /**
   * @deprecated This method is deprecated and will be removed in a future major version.
   * Please use the `loadSealedSession` helper and its `getLogoutUrl` method instead.
   *
   * getLogoutUrlFromSessionCookie takes in session cookie data, unseals the cookie, decodes the JWT claims,
   * and uses the session ID to generate the logout URL.
   *
   * Use this over `getLogoutUrl` if you'd like to the SDK to handle session cookies for you.
   */
  async getLogoutUrlFromSessionCookie({
    sessionData,
    cookiePassword = process.env.WORKOS_COOKIE_PASSWORD,
  }: SessionHandlerOptions): Promise<string> {
    const authenticationResponse = await this.authenticateWithSessionCookie({
      sessionData,
      cookiePassword,
    });

    if (!authenticationResponse.authenticated) {
      const { reason } = authenticationResponse;
      throw new Error(`Failed to extract session ID for logout URL: ${reason}`);
    }

    return this.getLogoutUrl({ sessionId: authenticationResponse.sessionId });
  }

  getJwksUrl(clientId: string): string {
    if (!clientId) {
      throw TypeError('clientId must be a valid clientId');
    }

    return `${this.workos.baseURL}/sso/jwks/${clientId}`;
  }
}
