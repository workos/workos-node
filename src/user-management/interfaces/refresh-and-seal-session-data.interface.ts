import { AuthenticationResponse } from './authentication-response.interface';

export enum RefreshAndSealSessionDataFailureReason {
  /**
   * @deprecated To be removed in a future major version.
   */
  INVALID_SESSION_COOKE = 'invalid_session_cookie',
  INVALID_SESSION_COOKIE = 'invalid_session_cookie',
  NO_SESSION_COOKIE_PROVIDED = 'no_session_cookie_provided',

  // API OauthErrors for refresh tokens
  INVALID_GRANT = 'invalid_grant',
  MFA_ENROLLMENT = 'mfa_enrollment',
  SSO_REQUIRED = 'sso_required',
  /**
   * @deprecated To be removed in a future major version.
   */
  ORGANIZATION_NOT_AUTHORIZED = 'organization_not_authorized',
}

// TODO: These should be renamed since it's possible to have an unsealed session
type RefreshAndSealSessionDataFailedResponse = {
  authenticated: false;
  reason: RefreshAndSealSessionDataFailureReason;
};

type RefreshAndSealSessionDataSuccessResponse = {
  authenticated: true;
  session: string | AuthenticationResponse;
};

export type RefreshAndSealSessionDataResponse =
  | RefreshAndSealSessionDataFailedResponse
  | RefreshAndSealSessionDataSuccessResponse;
