import {
  AuthenticateUserWithTotpCredentials,
  AuthenticateWithTotpOptions,
  SerializedAuthenticateWithTotpOptions,
  WithResolvedClientId,
} from '../interfaces';

export const serializeAuthenticateWithTotpOptions = (
  options: WithResolvedClientId<AuthenticateWithTotpOptions> &
    AuthenticateUserWithTotpCredentials,
): SerializedAuthenticateWithTotpOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:mfa-totp',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  authentication_challenge_id: options.authenticationChallengeId,
  pending_authentication_token: options.pendingAuthenticationToken,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
