type RefreshAndSealSessionDataFailureReason =
  | 'invalid_session_cookie'
  | 'no_session_cookie_provided'
  // TODO: Improve OauthException typing and pull in reasons from there
  // instead of leaving this type wide open
  | string
  | undefined;

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
