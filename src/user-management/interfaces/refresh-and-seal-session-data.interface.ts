import { AuthenticateWithSessionCookieSuccessResponse } from './authenticate-with-session-cookie.interface';
import { AuthenticationResponse } from './authentication-response.interface';

export enum RefreshSessionFailureReason {
  INVALID_SESSION_COOKIE = 'invalid_session_cookie',
  NO_SESSION_COOKIE_PROVIDED = 'no_session_cookie_provided',

  // API OauthErrors for refresh tokens
  INVALID_GRANT = 'invalid_grant',
  MFA_ENROLLMENT = 'mfa_enrollment',
  SSO_REQUIRED = 'sso_required',
}

type RefreshSessionFailedResponse = {
  authenticated: false;
  reason: RefreshSessionFailureReason;
};

type RefreshSessionSuccessResponse = Omit<
  AuthenticateWithSessionCookieSuccessResponse,
  // accessToken is available in the session object and with session
  // helpers isn't necessarily useful to return top level
  'accessToken'
> & {
  authenticated: true;
  session?: AuthenticationResponse;
  sealedSession?: string;
};

export type RefreshSessionResponse =
  | RefreshSessionFailedResponse
  | RefreshSessionSuccessResponse;
