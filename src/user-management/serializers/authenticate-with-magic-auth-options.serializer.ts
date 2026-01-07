import {
  AuthenticateUserWithMagicAuthCredentials,
  AuthenticateWithMagicAuthOptions,
  SerializedAuthenticateWithMagicAuthOptions,
  WithResolvedClientId,
} from '../interfaces';

export const serializeAuthenticateWithMagicAuthOptions = (
  options: WithResolvedClientId<AuthenticateWithMagicAuthOptions> &
    AuthenticateUserWithMagicAuthCredentials,
): SerializedAuthenticateWithMagicAuthOptions => ({
  grant_type: 'urn:workos:oauth:grant-type:magic-auth:code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  email: options.email,
  invitation_token: options.invitationToken,
  link_authorization_code: options.linkAuthorizationCode,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
