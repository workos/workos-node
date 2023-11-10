import {
  AuthenticateUserWithMagicAuthCredentials,
  AuthenticateWithMagicAuthOptions,
  SerializedAuthenticateWithMagicAuthOptions,
} from '../interfaces';

export const serializeAuthenticateWithMagicAuthOptions = (
  options: AuthenticateWithMagicAuthOptions &
    AuthenticateUserWithMagicAuthCredentials,
): SerializedAuthenticateWithMagicAuthOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:magic-auth:code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  user_id: options.userId,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
