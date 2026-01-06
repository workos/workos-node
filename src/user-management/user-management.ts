import { sealData, unsealData } from '../common/crypto/seal';
import { PaginationOptions } from '../common/interfaces/pagination-options.interface';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { AutoPaginatable } from '../common/utils/pagination';
import { getEnv } from '../common/utils/env';
import { toQueryString } from '../common/utils/query-string';
import { Challenge, ChallengeResponse } from '../mfa/interfaces';
import { deserializeChallenge } from '../mfa/serializers';
import {
  FeatureFlag,
  FeatureFlagResponse,
} from '../feature-flags/interfaces/feature-flag.interface';
import { deserializeFeatureFlag } from '../feature-flags/serializers/feature-flag.serializer';
import { WorkOS } from '../workos';
import {
  AuthenticateWithCodeAndVerifierOptions,
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
  ListSessionsOptions,
  ListUsersOptions,
  ListUserFeatureFlagsOptions,
  LogoutURLOptions,
  MagicAuth,
  MagicAuthResponse,
  PasswordReset,
  PasswordResetResponse,
  ResetPasswordOptions,
  SendVerificationEmailOptions,
  SerializedAuthenticateWithCodeAndVerifierOptions,
  SerializedAuthenticateWithCodeOptions,
  SerializedAuthenticateWithMagicAuthOptions,
  SerializedAuthenticateWithPasswordOptions,
  SerializedAuthenticateWithRefreshTokenOptions,
  SerializedAuthenticateWithRefreshTokenPublicClientOptions,
  SerializedAuthenticateWithTotpOptions,
  SerializedCreateMagicAuthOptions,
  SerializedCreatePasswordResetOptions,
  SerializedCreateUserOptions,
  SerializedListSessionsOptions,
  SerializedListUsersOptions,
  SerializedResetPasswordOptions,
  SerializedVerifyEmailOptions,
  Session,
  SessionResponse,
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
import {
  PKCEAuthorizationURLResult,
  UserManagementAuthorizationURLOptions,
} from './interfaces/authorization-url-options.interface';
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
import {
  ListInvitationsOptions,
  SerializedListInvitationsOptions,
} from './interfaces/list-invitations-options.interface';
import {
  ListOrganizationMembershipsOptions,
  SerializedListOrganizationMembershipsOptions,
} from './interfaces/list-organization-memberships-options.interface';
import {
  OrganizationMembership,
  OrganizationMembershipResponse,
} from './interfaces/organization-membership.interface';
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
  deserializeSession,
  deserializeUser,
  serializeAuthenticateWithCodeAndVerifierOptions,
  serializeAuthenticateWithCodeOptions,
  serializeAuthenticateWithMagicAuthOptions,
  serializeAuthenticateWithPasswordOptions,
  serializeAuthenticateWithRefreshTokenOptions,
  serializeAuthenticateWithRefreshTokenPublicClientOptions,
  serializeAuthenticateWithTotpOptions,
  serializeCreateMagicAuthOptions,
  serializeCreatePasswordResetOptions,
  serializeCreateUserOptions,
  serializeEnrollAuthFactorOptions,
  serializeListSessionsOptions,
  serializeResetPasswordOptions,
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
import { CookieSession } from './session';
import { getJose } from '../utils/jose';

export class UserManagement {
  private _jwks:
    | ReturnType<typeof import('jose').createRemoteJWKSet>
    | undefined;
  public clientId: string | undefined;

  constructor(private readonly workos: WorkOS) {
    const { clientId } = workos.options;

    this.clientId = clientId;
  }

  async getJWKS(): Promise<
    ReturnType<typeof import('jose').createRemoteJWKSet> | undefined
  > {
    const { createRemoteJWKSet } = await getJose();
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
  }): CookieSession {
    return new CookieSession(this, options.sessionData, options.cookiePassword);
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

  async listUsers(
    options?: ListUsersOptions,
  ): Promise<AutoPaginatable<User, SerializedListUsersOptions>> {
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

  /**
   * Exchange an authorization code for tokens.
   *
   * Auto-detects public vs confidential client mode:
   * - If codeVerifier is provided: Uses PKCE flow (public client)
   * - If no codeVerifier: Uses client_secret from API key (confidential client)
   *
   * @throws Error if neither codeVerifier nor API key is available
   */
  async authenticateWithCode(
    payload: AuthenticateWithCodeOptions,
  ): Promise<AuthenticationResponse> {
    const { session, codeVerifier, ...remainingPayload } = payload;

    const usePublicClientFlow = !!codeVerifier;
    const hasApiKey = !!this.workos.key;

    if (!usePublicClientFlow && !hasApiKey) {
      throw new Error(
        'authenticateWithCode requires either a codeVerifier (for public clients) ' +
          'or an API key configured on the WorkOS instance (for confidential clients).',
      );
    }

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithCodeOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithCodeOptions({
        ...remainingPayload,
        codeVerifier,
        clientSecret: usePublicClientFlow ? undefined : this.workos.key,
      }),
      { skipApiKeyCheck: usePublicClientFlow },
    );

    return this.prepareAuthenticationResponse({
      authenticationResponse: deserializeAuthenticationResponse(data),
      session,
    });
  }

  /**
   * Exchange an authorization code for tokens using PKCE (public client flow).
   * Use this instead of authenticateWithCode() when the client cannot securely
   * store a client_secret (browser, mobile, CLI, desktop apps).
   *
   * @param payload.clientId - Your WorkOS client ID
   * @param payload.code - The authorization code from the OAuth callback
   * @param payload.codeVerifier - The PKCE code verifier used to generate the code challenge
   */
  async authenticateWithCodeAndVerifier(
    payload: AuthenticateWithCodeAndVerifierOptions,
  ): Promise<AuthenticationResponse> {
    const { session, ...remainingPayload } = payload;

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      SerializedAuthenticateWithCodeAndVerifierOptions
    >(
      '/user_management/authenticate',
      serializeAuthenticateWithCodeAndVerifierOptions(remainingPayload),
      { skipApiKeyCheck: true },
    );

    return this.prepareAuthenticationResponse({
      authenticationResponse: deserializeAuthenticationResponse(data),
      session,
    });
  }

  /**
   * Refresh an access token using a refresh token.
   * Automatically detects public client mode - if no API key is configured,
   * omits client_secret from the request.
   */
  async authenticateWithRefreshToken(
    payload: AuthenticateWithRefreshTokenOptions,
  ): Promise<AuthenticationResponse> {
    const { session, ...remainingPayload } = payload;
    const isPublicClient = !this.workos.key;

    const body = isPublicClient
      ? serializeAuthenticateWithRefreshTokenPublicClientOptions(
          remainingPayload,
        )
      : serializeAuthenticateWithRefreshTokenOptions({
          ...remainingPayload,
          clientSecret: this.workos.key,
        });

    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      | SerializedAuthenticateWithRefreshTokenOptions
      | SerializedAuthenticateWithRefreshTokenPublicClientOptions
    >('/user_management/authenticate', body, {
      skipApiKeyCheck: isPublicClient,
    });

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
    cookiePassword = getEnv('WORKOS_COOKIE_PASSWORD'),
  }: AuthenticateWithSessionCookieOptions): Promise<
    | AuthenticateWithSessionCookieSuccessResponse
    | AuthenticateWithSessionCookieFailedResponse
  > {
    if (!cookiePassword) {
      throw new Error('Cookie password is required');
    }

    const jwks = await this.getJWKS();

    if (!jwks) {
      throw new Error('Must provide clientId to initialize JWKS');
    }

    const { decodeJwt } = await getJose();

    if (!sessionData) {
      return {
        authenticated: false,
        reason:
          AuthenticateWithSessionCookieFailureReason.NO_SESSION_COOKIE_PROVIDED,
      };
    }

    const session = await unsealData<SessionCookieData>(sessionData, {
      password: cookiePassword,
    });

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
      roles,
      permissions,
      entitlements,
      feature_flags: featureFlags,
    } = decodeJwt<AccessToken>(session.accessToken);

    return {
      authenticated: true,
      sessionId,
      organizationId,
      role,
      roles,
      user: session.user,
      permissions,
      entitlements,
      featureFlags,
      accessToken: session.accessToken,
      authenticationMethod: session.authenticationMethod,
    };
  }

  private async isValidJwt(accessToken: string): Promise<boolean> {
    const jwks = await this.getJWKS();
    const { jwtVerify } = await getJose();
    if (!jwks) {
      throw new Error('Must provide clientId to initialize JWKS');
    }

    try {
      await jwtVerify(accessToken, jwks);
      return true;
    } catch (e) {
      // Only treat as invalid JWT if it's an actual JWT/JWS error from jose
      // Network errors, crypto failures, etc. should propagate
      if (
        e instanceof Error &&
        'code' in e &&
        typeof e.code === 'string' &&
        (e.code.startsWith('ERR_JWT_') || e.code.startsWith('ERR_JWS_'))
      ) {
        return false;
      }
      throw e;
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
      if (!this.workos.key) {
        throw new Error(
          'Session sealing requires server-side usage with an API key. ' +
            'Public clients should store tokens directly ' +
            '(e.g., secure storage on mobile, keychain on desktop).',
        );
      }

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

    const { decodeJwt } = await getJose();

    const { org_id: organizationIdFromAccessToken } = decodeJwt<AccessToken>(
      authenticationResponse.accessToken,
    );

    const sessionData: SessionCookieData = {
      organizationId: organizationIdFromAccessToken,
      user: authenticationResponse.user,
      accessToken: authenticationResponse.accessToken,
      refreshToken: authenticationResponse.refreshToken,
      authenticationMethod: authenticationResponse.authenticationMethod,
      impersonator: authenticationResponse.impersonator,
    };

    return sealData(sessionData, {
      password: cookiePassword,
    });
  }

  async getSessionFromCookie({
    sessionData,
    cookiePassword = getEnv('WORKOS_COOKIE_PASSWORD'),
  }: SessionHandlerOptions): Promise<SessionCookieData | undefined> {
    if (!cookiePassword) {
      throw new Error('Cookie password is required');
    }

    if (sessionData) {
      return unsealData<SessionCookieData>(sessionData, {
        password: cookiePassword,
      });
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
  ): Promise<AutoPaginatable<Factor, PaginationOptions>> {
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

  async listUserFeatureFlags(
    options: ListUserFeatureFlagsOptions,
  ): Promise<AutoPaginatable<FeatureFlag>> {
    const { userId, ...paginationOptions } = options;

    return new AutoPaginatable(
      await fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
        this.workos,
        `/user_management/users/${userId}/feature-flags`,
        deserializeFeatureFlag,
        paginationOptions,
      ),
      (params) =>
        fetchAndDeserialize<FeatureFlagResponse, FeatureFlag>(
          this.workos,
          `/user_management/users/${userId}/feature-flags`,
          deserializeFeatureFlag,
          params,
        ),
      paginationOptions,
    );
  }

  async listSessions(
    userId: string,
    options?: ListSessionsOptions,
  ): Promise<AutoPaginatable<Session, SerializedListSessionsOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<SessionResponse, Session>(
        this.workos,
        `/user_management/users/${userId}/sessions`,
        deserializeSession,
        options ? serializeListSessionsOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<SessionResponse, Session>(
          this.workos,
          `/user_management/users/${userId}/sessions`,
          deserializeSession,
          params,
        ),
      options ? serializeListSessionsOptions(options) : undefined,
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
  ): Promise<
    AutoPaginatable<
      OrganizationMembership,
      SerializedListOrganizationMembershipsOptions
    >
  > {
    const serializedOptions =
      serializeListOrganizationMembershipsOptions(options);

    return new AutoPaginatable(
      await fetchAndDeserialize<
        OrganizationMembershipResponse,
        OrganizationMembership
      >(
        this.workos,
        '/user_management/organization_memberships',
        deserializeOrganizationMembership,
        serializedOptions,
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
      serializedOptions,
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
  ): Promise<AutoPaginatable<Invitation, SerializedListInvitationsOptions>> {
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

  async resendInvitation(invitationId: string): Promise<Invitation> {
    const { data } = await this.workos.post<InvitationResponse, any>(
      `/user_management/invitations/${invitationId}/resend`,
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

  /**
   * Generate an OAuth 2.0 authorization URL.
   *
   * For public clients (browser, mobile, CLI), include PKCE parameters:
   * - Generate PKCE using workos.pkce.generate()
   * - Pass codeChallenge and codeChallengeMethod here
   * - Store codeVerifier and pass to authenticateWithCode() later
   *
   * Or use getAuthorizationUrlWithPKCE() which handles PKCE automatically.
   */
  getAuthorizationUrl(options: UserManagementAuthorizationURLOptions): string {
    const {
      connectionId,
      codeChallenge,
      codeChallengeMethod,
      clientId,
      domainHint,
      loginHint,
      organizationId,
      provider,
      providerQueryParams,
      providerScopes,
      prompt,
      redirectUri,
      state,
      screenHint,
    } = options;

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
      provider_query_params: providerQueryParams,
      provider_scopes: providerScopes,
      prompt,
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      screen_hint: screenHint,
    });

    return `${this.workos.baseURL}/user_management/authorize?${query}`;
  }

  /**
   * Generate an OAuth 2.0 authorization URL with automatic PKCE.
   *
   * This method generates PKCE parameters internally and returns them along with
   * the authorization URL. Use this for public clients (CLI apps, Electron, mobile)
   * that cannot securely store a client secret.
   *
   * @returns Object containing url, state, and codeVerifier
   *
   * @example
   * ```typescript
   * const { url, state, codeVerifier } = await workos.userManagement.getAuthorizationUrlWithPKCE({
   *   provider: 'authkit',
   *   clientId: 'client_123',
   *   redirectUri: 'myapp://callback',
   * });
   *
   * // Store state and codeVerifier securely, then redirect user to url
   * // After callback, exchange the code:
   * const response = await workos.userManagement.authenticateWithCode({
   *   code: authorizationCode,
   *   codeVerifier,
   *   clientId: 'client_123',
   * });
   * ```
   */
  async getAuthorizationUrlWithPKCE(
    options: Omit<
      UserManagementAuthorizationURLOptions,
      'codeChallenge' | 'codeChallengeMethod' | 'state'
    >,
  ): Promise<PKCEAuthorizationURLResult> {
    const {
      clientId,
      connectionId,
      domainHint,
      loginHint,
      organizationId,
      provider,
      providerQueryParams,
      providerScopes,
      prompt,
      redirectUri,
      screenHint,
    } = options;

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

    // Generate PKCE parameters
    const pkce = await this.workos.pkce.generate();

    // Generate secure random state
    const state = this.workos.pkce.generateCodeVerifier(43);

    const query = toQueryString({
      connection_id: connectionId,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: 'S256',
      organization_id: organizationId,
      domain_hint: domainHint,
      login_hint: loginHint,
      provider,
      provider_query_params: providerQueryParams,
      provider_scopes: providerScopes,
      prompt,
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      screen_hint: screenHint,
    });

    const url = `${this.workos.baseURL}/user_management/authorize?${query}`;

    return { url, state, codeVerifier: pkce.codeVerifier };
  }

  getLogoutUrl(options: LogoutURLOptions): string {
    const { sessionId, returnTo } = options;

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

  getJwksUrl(clientId: string): string {
    if (!clientId) {
      throw new TypeError('clientId must be a valid clientId');
    }

    return `${this.workos.baseURL}/sso/jwks/${clientId}`;
  }
}
