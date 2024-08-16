import { UserManagement } from './user-management';
import { IronSessionProvider } from '../common/iron-session/iron-session-provider';
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
import { OauthException } from '../common/exceptions/oauth.exception';
import {
  AccessToken,
  AuthenticateWithSessionCookieFailedResponse,
  AuthenticateWithSessionCookieFailureReason,
  AuthenticateWithSessionCookieSuccessResponse,
  AuthenticationResponse,
  RefreshAndSealSessionDataFailureReason,
  RefreshAndSealSessionDataResponse,
  SessionCookieData,
} from './interfaces';

type RefreshOptions =
  | {
      sealSession: true;
      cookiePassword: string;
      organizationId?: string;
    }
  | {
      sealSession: false;
      cookiePassword?: string;
      organizationId?: string;
    };

export class Session {
  private jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
  private userManagement: UserManagement;
  private ironSessionProvider: IronSessionProvider;
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
    this.ironSessionProvider = userManagement.ironSessionProvider;
    this.cookiePassword = cookiePassword;
    this.sessionData = sessionData;

    const { clientId } = this.userManagement;

    this.jwks = clientId
      ? createRemoteJWKSet(new URL(userManagement.getJwksUrl(clientId)))
      : undefined;
  }

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

    const session =
      await this.ironSessionProvider.unsealData<SessionCookieData>(
        this.sessionData,
        {
          password: this.cookiePassword,
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
    } = decodeJwt<AccessToken>(session.accessToken);

    return {
      authenticated: true,
      sessionId,
      organizationId,
      role,
      permissions,
      user: session.user,
      impersonator: session.impersonator,
    };
  }

  async refresh(
    options: RefreshOptions,
  ): Promise<RefreshAndSealSessionDataResponse> {
    if (options.sealSession && !options.cookiePassword) {
      throw new Error('Cookie password is required for sealed sessions');
    }

    const session =
      await this.ironSessionProvider.unsealData<SessionCookieData>(
        this.sessionData,
        {
          password: options.cookiePassword as string,
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
      const authenticationResponse =
        await this.userManagement.authenticateWithRefreshToken({
          clientId: this.userManagement.clientId as string,
          refreshToken: session.refreshToken,
          organizationId:
            options.organizationId ?? organizationIdFromAccessToken,
          session: {
            // We want to store the new sealed session in this class instance, so this always needs to be true
            sealSession: true,
            cookiePassword: options.cookiePassword ?? this.cookiePassword,
          },
        });

      if (options.sealSession) this.cookiePassword = options.cookiePassword;
      this.sessionData = authenticationResponse.sealedSession as string;

      return {
        authenticated: true,
        session: options.sealSession
          ? (authenticationResponse.sealedSession as string)
          : (authenticationResponse as AuthenticationResponse),
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

  async getLogoutUrl() {
    const authenticationResponse = await this.authenticate();

    if (!authenticationResponse.authenticated) {
      const { reason } = authenticationResponse;
      throw new Error(`Failed to extract session ID for logout URL: ${reason}`);
    }

    return this.userManagement.getLogoutUrl({
      sessionId: authenticationResponse.sessionId,
    });
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
}
