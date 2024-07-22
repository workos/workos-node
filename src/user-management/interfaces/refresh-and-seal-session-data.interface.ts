type RefreshAndSealSessionDataFailureReason =
  | 'invalid_session_cookie'
  | 'no_session_cookie_provided';

type RefreshAndSealSessionDataFailedResponse = {
  authenticated: false;
  reason: RefreshAndSealSessionDataFailureReason;
};

type RefreshAndSealSessionDataSuccessResponse = {
  authenticated: true;
  sealedSessionData: string;
};

export type RefreshAndSealSessionDataResponse =
  | RefreshAndSealSessionDataFailedResponse
  | RefreshAndSealSessionDataSuccessResponse;
