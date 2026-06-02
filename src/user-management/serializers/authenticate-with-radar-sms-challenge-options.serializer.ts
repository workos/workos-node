import {
  AuthenticateUserWithRadarSmsChallengeCredentials,
  AuthenticateWithRadarSmsChallengeOptions,
  SerializedAuthenticateWithRadarSmsChallengeOptions,
} from '../interfaces/authenticate-with-radar-sms-challenge-options.interface';
import { WithResolvedClientId } from '../interfaces';

export const serializeAuthenticateWithRadarSmsChallengeOptions = (
  options: WithResolvedClientId<AuthenticateWithRadarSmsChallengeOptions> &
    AuthenticateUserWithRadarSmsChallengeCredentials,
): SerializedAuthenticateWithRadarSmsChallengeOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:radar-sms-challenge:code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  verification_id: options.verificationId,
  phone_number: options.phoneNumber,
  pending_authentication_token: options.pendingAuthenticationToken,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
