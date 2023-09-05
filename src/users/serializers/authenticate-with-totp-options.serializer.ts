import {} from '../interfaces';
import {
  AuthenticateUserWithTotpCredentials,
  AuthenticateWithTotpOptions,
  SerializedAuthenticateWithTotpOptions,
} from '../interfaces/authenticate-with-totp-options.interface';

export const serializeAuthenticateWithTotpOptions = (
  options: AuthenticateWithTotpOptions & AuthenticateUserWithTotpCredentials,
): SerializedAuthenticateWithTotpOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:mfa-totp',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  authentication_challenge_id: options.authenticationChallengeId,
  pending_authentication_token: options.pendingAuthenticationToken,
});
