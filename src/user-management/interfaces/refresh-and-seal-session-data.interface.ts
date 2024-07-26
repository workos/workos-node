export enum RefreshAndSealSessionDataFailureReason {
  /**
   * @deprecated To be removed in a future major version.
   */
  INVALID_SESSION_COOKE = 'invalid_session_cookie',
  INVALID_SESSION_COOKIE = 'invalid_session_cookie',
  NO_SESSION_COOKIE_PROVIDED = 'no_session_cookie_provided',
  // API OauthErrors for refresh tokens
  INVALID_GRANT = 'invalid_grant',
  ORGANIZATION_NOT_AUTHORIZED = 'organization_not_authorized',
}

type RefreshAndSealSessionDataFailedResponse = {
  authenticated: false;
  reason: RefreshAndSealSessionDataFailureReason;
};

type RefreshAndSealSessionDataSuccessResponse = {
  authenticated: true;
  sealedSession: string;
};

export type RefreshAndSealSessionDataResponse =
  | RefreshAndSealSessionDataFailedResponse
  | RefreshAndSealSessionDataSuccessResponse;
