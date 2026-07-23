// @oagen-ignore-file
import { GenericServerException } from '../common/exceptions/generic-server.exception';
import { OauthException } from '../common/exceptions/oauth.exception';
import { RateLimitExceededException } from '../common/exceptions/rate-limit-exceeded.exception';
import {
  UserManagementAccessToken,
  AuthenticateWithSessionCookieFailedResponse,
  AuthenticateWithSessionCookieFailureReason,
  AuthenticateWithSessionCookieSuccessResponse,
  AuthenticationResponse,
  RefreshSessionFailureReason,
  RefreshSessionResponse,
  SessionCookieData,
} from './interfaces';
import { UserManagement } from './user-management';
import { unsealData } from '../common/crypto/seal';
import { getJose } from '../utils/jose';

type RefreshOptions = {
  cookiePassword?: string;
  organizationId?: string;
};

export class CookieSession {
  private userManagement: UserManagement;
  private cookiePassword: string;
  private sessionData: string;

  constructor(
    userManagement: UserManagement,
    sessionData: string,
    cookiePassword: string,
  ) {
    if (!cookiePassword) {
      throw new Error('cookiePassword is required');
    }

    this.userManagement = userManagement;
    this.cookiePassword = cookiePassword;
    this.sessionData = sessionData;
  }

  /**
   * Authenticates a user with a session cookie.
   *
   * @returns An object indicating whether the authentication was successful or not. If successful, it will include the user's session data.
   */
  async authenticate(): Promise<
    | AuthenticateWithSessionCookieSuccessResponse
    | AuthenticateWithSessionCookieFailedResponse
  > {
    if (!this.sessionData) {
      return {
        authenticated: false,
        reason:
          AuthenticateWithSessionCookieFailureReason.NO_SESSION_COOKIE_PROVIDED,
      };
    }

    // unsealData returns {} for known seal errors (expired, bad hmac, etc.)
    // Unknown errors propagate - don't catch them as "invalid session"
    const session = await unsealData<SessionCookieData>(this.sessionData, {
      password: this.cookiePassword,
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

    const { decodeJwt } = await getJose();

    const {
      sid: sessionId,
      org_id: organizationId,
      role,
      roles,
      permissions,
      entitlements,
      feature_flags: featureFlags,
    } = decodeJwt<UserManagementAccessToken>(session.accessToken);

    return {
      authenticated: true,
      sessionId,
      organizationId,
      role,
      roles,
      permissions,
      entitlements,
      featureFlags,
      user: session.user,
      authenticationMethod: session.authenticationMethod,
      impersonator: session.impersonator,
      accessToken: session.accessToken,
    };
  }

  /**
   * Refreshes the user's session.
   *
   * @param options - Optional options for refreshing the session.
   * @param options.cookiePassword - The password to use for the new session cookie.
   * @param options.organizationId - The organization ID to use for the new session cookie.
   * @returns An object indicating whether the refresh was successful or not. If successful, it will include the new sealed session data.
   */
  async refresh(options: RefreshOptions = {}): Promise<RefreshSessionResponse> {
    const { decodeJwt } = await getJose();
    const session = await unsealData<SessionCookieData>(this.sessionData, {
      password: this.cookiePassword,
    });

    if (!session.refreshToken || !session.user) {
      return {
        authenticated: false,
        reason: RefreshSessionFailureReason.INVALID_SESSION_COOKIE,
        retryable: false,
      };
    }

    const { org_id: organizationIdFromUserManagementAccessToken } =
      decodeJwt<UserManagementAccessToken>(session.accessToken);

    try {
      const cookiePassword = options.cookiePassword ?? this.cookiePassword;

      const authenticationResponse =
        await this.userManagement.authenticateWithRefreshToken({
          clientId: this.userManagement.clientId as string,
          refreshToken: session.refreshToken,
          organizationId:
            options.organizationId ??
            organizationIdFromUserManagementAccessToken,
          session: {
            // We want to store the new sealed session in this class instance, so this always needs to be true
            sealSession: true,
            cookiePassword,
          },
        });

      // Update the password if a new one was provided
      if (options.cookiePassword) {
        this.cookiePassword = options.cookiePassword;
      }

      this.sessionData = authenticationResponse.sealedSession as string;

      const {
        sid: sessionId,
        org_id: organizationId,
        role,
        roles,
        permissions,
        entitlements,
        feature_flags: featureFlags,
      } = decodeJwt<UserManagementAccessToken>(
        authenticationResponse.accessToken,
      );

      // TODO: Returning `session` here means there's some duplicated data.
      // Slim down the return type in a future major version.
      return {
        authenticated: true,
        sealedSession: authenticationResponse.sealedSession,
        session: authenticationResponse as AuthenticationResponse,
        authenticationMethod: authenticationResponse.authenticationMethod,
        sessionId,
        organizationId,
        role,
        roles,
        permissions,
        entitlements,
        featureFlags,
        user: session.user,
        impersonator: session.impersonator,
      };
    } catch (error) {
      // Terminal authentication failures — the session is over. Surface a
      // typed unauthenticated result so callers redirect to sign in.
      if (
        error instanceof OauthException &&
        (error.error === RefreshSessionFailureReason.INVALID_GRANT ||
          error.error === RefreshSessionFailureReason.MFA_ENROLLMENT ||
          error.error === RefreshSessionFailureReason.SSO_REQUIRED)
      ) {
        return {
          authenticated: false,
          reason: error.error,
          retryable: false,
        };
      }

      // Transient/operational failures — the refresh token is likely still
      // valid. Surface a retryable result so callers keep the existing session
      // and retry later rather than signing the user out.
      const retryableFailure = classifyRetryableRefreshError(error);
      if (retryableFailure) {
        return retryableFailure;
      }

      throw error;
    }
  }

  /**
   * Gets the URL to redirect the user to for logging out.
   *
   * @returns The URL to redirect the user to for logging out.
   */
  async getLogoutUrl({
    returnTo,
  }: { returnTo?: string } = {}): Promise<string> {
    const authenticationResponse = await this.authenticate();

    if (!authenticationResponse.authenticated) {
      const { reason } = authenticationResponse;
      throw new Error(`Failed to extract session ID for logout URL: ${reason}`);
    }

    return this.userManagement.getLogoutUrl({
      sessionId: authenticationResponse.sessionId,
      returnTo,
    });
  }

  private async isValidJwt(accessToken: string): Promise<boolean> {
    const { jwtVerify } = await getJose();
    const jwks = await this.userManagement.getJWKS();
    if (!jwks) {
      throw new Error(
        'Missing client ID. Did you provide it when initializing WorkOS?',
      );
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
}

/**
 * Classifies an error thrown while refreshing as a transient, retryable
 * failure, or returns `null` when the error is not recognized as retryable
 * (and should be rethrown). Retries at the HTTP transport layer are already
 * exhausted by the time an error reaches here.
 */
function classifyRetryableRefreshError(
  error: unknown,
): RefreshSessionResponse | null {
  // 429 — the server asked us to back off (e.g. short-lived refresh
  // contention). Checked first to surface the parsed `Retry-After`.
  if (error instanceof RateLimitExceededException) {
    return {
      authenticated: false,
      reason: RefreshSessionFailureReason.RATE_LIMIT_EXCEEDED,
      retryable: true,
      retryAfter: error.retryAfter ?? undefined,
      error,
    };
  }

  // Classify by HTTP status regardless of which exception wraps it — a request
  // timeout, for example, surfaces as an `OauthException` (status 408) because
  // the transport gives it an `error` body.
  const status = getErrorStatus(error);

  if (status === 429) {
    return {
      authenticated: false,
      reason: RefreshSessionFailureReason.RATE_LIMIT_EXCEEDED,
      retryable: true,
      error,
    };
  }

  if (status === 408) {
    return {
      authenticated: false,
      reason: RefreshSessionFailureReason.TIMEOUT,
      retryable: true,
      error,
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      authenticated: false,
      reason: RefreshSessionFailureReason.SERVER_ERROR,
      retryable: true,
      error,
    };
  }

  // Network-level failures (dropped connection, DNS, connection reset) surface
  // from the transport as a `TypeError`, which the client rewraps as a generic
  // `Error` with the original attached as `cause`.
  if (isNetworkError(error)) {
    return {
      authenticated: false,
      reason: RefreshSessionFailureReason.NETWORK_ERROR,
      retryable: true,
      error,
    };
  }

  return null;
}

function getErrorStatus(error: unknown): number | undefined {
  if (
    error instanceof OauthException ||
    error instanceof GenericServerException
  ) {
    return error.status;
  }

  return undefined;
}

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof Error && error.cause instanceof TypeError)
  );
}
