import {
  AuthenticateUserWithMagicAuthCredentials,
  AuthenticateUserWithMagicAuthOptions,
  SerializedAuthenticateUserWithMagicAuthOptions,
} from '../interfaces';

export const serializeAuthenticateUserWithMagicAuthOptions = (
  options: AuthenticateUserWithMagicAuthOptions &
    AuthenticateUserWithMagicAuthCredentials,
): SerializedAuthenticateUserWithMagicAuthOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:magic-auth:code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  magic_auth_challenge_id: options.magicAuthChallengeId,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
  expires_in: options.expiresIn,
});
