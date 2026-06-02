import {
  AuthenticateUserWithRadarEmailChallengeCredentials,
  AuthenticateWithRadarEmailChallengeOptions,
  SerializedAuthenticateWithRadarEmailChallengeOptions,
} from '../interfaces/authenticate-with-radar-email-challenge-options.interface';
import { WithResolvedClientId } from '../interfaces';

export const serializeAuthenticateWithRadarEmailChallengeOptions = (
  options: WithResolvedClientId<AuthenticateWithRadarEmailChallengeOptions> &
    AuthenticateUserWithRadarEmailChallengeCredentials,
): SerializedAuthenticateWithRadarEmailChallengeOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:radar-email-challenge:code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  radar_challenge_id: options.radarChallengeId,
  pending_authentication_token: options.pendingAuthenticationToken,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
