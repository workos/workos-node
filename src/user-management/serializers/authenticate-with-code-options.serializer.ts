import {
  AuthenticateUserWithCodeCredentials,
  AuthenticateWithCodeOptions,
  SerializedAuthenticateWithCodeOptions,
  WithResolvedClientId,
} from '../interfaces';

export const serializeAuthenticateWithCodeOptions = (
  options: WithResolvedClientId<AuthenticateWithCodeOptions> &
    AuthenticateUserWithCodeCredentials,
): SerializedAuthenticateWithCodeOptions => ({
  grant_type: 'authorization_code',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  code: options.code,
  code_verifier: options.codeVerifier,
  invitation_token: options.invitationToken,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
