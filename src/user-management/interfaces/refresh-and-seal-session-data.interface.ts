type RefreshAndSealSessionDataFailureReason =
  | 'invalid_session_cookie'
  | 'no_session_cookie_provided'
  // API OauthErrors for refresh tokens
  | 'invalid_grant'
  | 'organization_not_authorized';

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
