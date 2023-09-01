import {} from '../interfaces';
import {
  AuthenticateUserWithTotpCredentials,
  AuthenticateUserWithTotpOptions,
  SerializedAuthenticateUserWithTotpOptions,
} from '../interfaces/authenticate-user-with-totp-options.interface';

export const serializeAuthenticateUserWithTotpOptions = (
  options: AuthenticateUserWithTotpOptions &
    AuthenticateUserWithTotpCredentials,
): SerializedAuthenticateUserWithTotpOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:mfa-totp',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  authentication_challenge_id: options.authenticationChallengeId,
  pending_authentication_token: options.pendingAuthenticationToken,
});
