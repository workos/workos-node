type AuthenticateWithCodeAndSealSessionDataFailureReason = 'no_code_provided';

type AuthenticateWithCodeAndSealSessionDataFailedResponse = {
  authenticated: false;
  reason: AuthenticateWithCodeAndSealSessionDataFailureReason;
};

type AuthenticateWithCodeAndSealSessionDataSuccessResponse = {
  authenticated: true;
  sealedSessionData: string;
};

export type AuthenticateWithCodeAndSealSessionDataResponse =
  | AuthenticateWithCodeAndSealSessionDataFailedResponse
  | AuthenticateWithCodeAndSealSessionDataSuccessResponse;
